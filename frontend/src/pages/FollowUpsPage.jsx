import React, { useState } from "react";

const SAMPLE_FOLLOWUPS = [
  {
    id: 1,
    patientName: "Aarav Sharma (Sample)",
    followUpDate: "2026-12-05",
    note: "Review blood test results and adjust dosage",
    reminderStatus: "Scheduled",
  },
  {
    id: 2,
    patientName: "Meera Nair (Sample)",
    followUpDate: "2026-12-10",
    note: "Post-checkup consultation",
    reminderStatus: "Pending",
  },
];

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState(SAMPLE_FOLLOWUPS);
  const [patientName, setPatientName] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [note, setNote] = useState("");
  const [reminderStatus, setReminderStatus] = useState("Pending");

  const handleAddFollowUp = (e) => {
    e.preventDefault();
    if (!patientName.trim() || !followUpDate) return;

    const newFollowUp = {
      id: Date.now(),
      patientName: patientName.trim(),
      followUpDate,
      note: note.trim() || "Routine follow-up",
      reminderStatus,
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);
    setPatientName("");
    setFollowUpDate("");
    setNote("");
    setReminderStatus("Pending");
  };

  return (
    <div style={{ padding: "1.5rem", maxWidth: "800px" }}>
      <h2>Follow-Ups</h2>

      <form onSubmit={handleAddFollowUp} style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <label>
          Patient Name (Sample only)
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="e.g., Rohan Kulkarni (Sample)"
            required
          />
        </label>

        <label>
          Follow-Up Date
          <input
            type="date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
            required
          />
        </label>

        <label>
          Short Note
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g., Check recovery progress"
          />
        </label>

        <label>
          Reminder Status
          <select value={reminderStatus} onChange={(e) => setReminderStatus(e.target.value)}>
            <option value="Pending">Pending</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Sent">Sent</option>
          </select>
        </label>

        <button type="submit">Create Follow-Up</button>
      </form>

      <h3>Upcoming Follow-Ups</h3>
      <ul>
        {followUps.map((item) => (
          <li key={item.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{item.patientName}</strong> — {item.followUpDate} | Note: {item.note} |{" "}
            <em>Status: {item.reminderStatus}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}