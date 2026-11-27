"""MediFlow backend: health check and appointment queue."""

from datetime import datetime, timezone
from threading import Lock

from flask import Flask, jsonify, request

app = Flask(__name__)
app.json.sort_keys = False  # keep fields in the order written below

# ---- Queue settings --------------------------------------------------------
CONSULTATION_MINUTES = 10  # assumed length of one consultation
STATUSES = ("Waiting", "In Consultation", "Completed")
_STATUS_LOOKUP = {s.lower(): s for s in STATUSES}

# ---- In-memory storage (cleared every time the server restarts) ------------
appointments = {}  # token -> appointment dict
_next_token = 1
_lock = Lock()


def _now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _error(message, code):
    return jsonify(error=message), code


def _patients_ahead(token):
    """Patients with a lower token who are still waiting or being seen."""
    return sum(
        1
        for a in appointments.values()
        if a["token"] < token and a["status"] in ("Waiting", "In Consultation")
    )


def _view(appt):
    """Copy of an appointment with the wait estimate added (Waiting only)."""
    data = dict(appt)
    if appt["status"] == "Waiting":
        ahead = _patients_ahead(appt["token"])
        data["patients_ahead"] = ahead
        data["estimated_wait_minutes"] = ahead * CONSULTATION_MINUTES
    else:
        data["patients_ahead"] = None
        data["estimated_wait_minutes"] = None
    return data


# ---- Routes ----------------------------------------------------------------
@app.get("/api/health")
def health():
    """Simple check that the server is up."""
    return jsonify(status="ok", message="MediFlow backend is running")


@app.post("/api/appointments")
def create_appointment():
    """Issue the next token for a new appointment."""
    global _next_token

    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return _error('Send a JSON body, e.g. {"patient_name": "Asha Patil"}.', 400)

    name = str(body.get("patient_name") or "").strip()
    if not name:
        return _error("patient_name is required.", 400)

    with _lock:
        token = _next_token
        _next_token += 1
        now = _now()
        appt = {
            "token": token,
            "patient_name": name,
            "doctor": str(body.get("doctor") or "").strip() or None,
            "reason": str(body.get("reason") or "").strip() or None,
            "status": "Waiting",
            "issued_at": now,
            "updated_at": now,
        }
        appointments[token] = appt
        return jsonify(_view(appt)), 201


@app.get("/api/appointments")
def list_appointments():
    """All appointments in token order. Optional filter: ?status=Waiting"""
    wanted = None
    raw = request.args.get("status")
    if raw:
        wanted = _STATUS_LOOKUP.get(raw.strip().lower())
        if wanted is None:
            return _error(f"status must be one of: {', '.join(STATUSES)}.", 400)

    with _lock:
        ordered = sorted(appointments.values(), key=lambda a: a["token"])
        items = [_view(a) for a in ordered if wanted is None or a["status"] == wanted]
    return jsonify(items)


@app.get("/api/appointments/<int:token>")
def get_appointment(token):
    with _lock:
        appt = appointments.get(token)
        if appt is None:
            return _error(f"No appointment with token {token}.", 404)
        return jsonify(_view(appt))


@app.patch("/api/appointments/<int:token>/status")
def update_status(token):
    """Staff sets Waiting, In Consultation or Completed."""
    body = request.get_json(silent=True)
    raw = body.get("status") if isinstance(body, dict) else None
    status = _STATUS_LOOKUP.get(str(raw or "").strip().lower())
    if status is None:
        return _error(f"status must be one of: {', '.join(STATUSES)}.", 400)

    with _lock:
        appt = appointments.get(token)
        if appt is None:
            return _error(f"No appointment with token {token}.", 404)
        appt["status"] = status
        appt["updated_at"] = _now()
        return jsonify(_view(appt))


@app.get("/api/queue")
def queue():
    """Who is being seen now, and the waiting list in token order."""
    with _lock:
        ordered = sorted(appointments.values(), key=lambda a: a["token"])
        in_consultation = [_view(a) for a in ordered if a["status"] == "In Consultation"]
        waiting = [_view(a) for a in ordered if a["status"] == "Waiting"]
    return jsonify(
        consultation_minutes=CONSULTATION_MINUTES,
        in_consultation=in_consultation,
        waiting=waiting,
    )


# ---- JSON errors for unknown URLs / wrong methods --------------------------
@app.errorhandler(404)
def not_found(_):
    return _error("Not found.", 404)


@app.errorhandler(405)
def method_not_allowed(_):
    return _error("Method not allowed.", 405)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
