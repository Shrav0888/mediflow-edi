import { useState } from 'react'
import './App.css'

const startingAppointments = [
  { id: 1, patient: 'Aarav Mehta', doctor: 'Dr. N. Shah', date: '2026-11-27', time: '09:30', status: 'Confirmed', token: 1, wait: 0 },
  { id: 2, patient: 'Priya Sharma', doctor: 'Dr. A. Rao', date: '2026-11-27', time: '10:15', status: 'Waiting', token: 2, wait: 15 },
  { id: 3, patient: 'Kabir Patil', doctor: 'Dr. N. Shah', date: '2026-11-27', time: '11:00', status: 'Confirmed', token: 3, wait: 30 },
]

function App() {
  const [activePage, setActivePage] = useState('Overview')
  const [appointments, setAppointments] = useState(startingAppointments)
  const [nextToken, setNextToken] = useState(4)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [notice, setNotice] = useState('')

  function addAppointment(event) {
    event.preventDefault()

    const form = event.currentTarget
    const formData = new FormData(form)

    const newAppointment = {
      id: Date.now(),
      patient: formData.get('patient').trim(),
      doctor: formData.get('doctor'),
      date: formData.get('date'),
      time: formData.get('time'),
      status: 'Waiting',
      token: nextToken,
      wait: appointments.filter((item) => item.status === 'Waiting').length * 15,
    }

    setAppointments((current) => [...current, newAppointment])
    setNextToken((current) => current + 1)
    setNotice(`Appointment booked for ${newAppointment.patient}.`)
    setBookingOpen(false)
    setActivePage('Appointments')
    form.reset()
  }

  const waitingAppointments = appointments.filter(
    (appointment) => appointment.status === 'Waiting',
  )

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M</div>
          <div>
            <strong>MediFlow</strong>
            <span>Clinic management</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>
        <nav className="navigation">
          {[
            ['Overview', '⌂'],
            ['Appointments', '▦'],
            ['Patients', '♙'],
            ['Medical Records', '▤'],
            ['Follow-ups', '◷'],
          ].map(([label, icon]) => (
            <button
              className={`nav-item ${activePage === label ? 'active' : ''}`}
              key={label}
              onClick={() => {
                setActivePage(label)
                setBookingOpen(false)
                setNotice('')
              }}
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="status-dot" />
          Clinic system ready
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">FRIDAY, NOVEMBER 27</span>
            <h1>{bookingOpen ? 'Book an appointment' : activePage}</h1>
          </div>
          <button className="profile-button" aria-label="User profile">SN</button>
        </header>

        {notice && <div className="notice">{notice}</div>}

        {bookingOpen ? (
          <section className="booking-panel">
            <div className="section-heading">
              <div>
                <h2>New appointment</h2>
                <p>Enter the patient and visit details.</p>
              </div>
              <button className="text-button" onClick={() => setBookingOpen(false)}>
                Cancel
              </button>
            </div>

            <form className="booking-form" onSubmit={addAppointment}>
              <label>
                Patient name
                <input name="patient" placeholder="e.g. Anaya Deshmukh" required />
              </label>
              <label>
                Doctor
                <select name="doctor" required defaultValue="">
                  <option value="" disabled>Select a doctor</option>
                  <option>Dr. Mehta</option>
                  <option>Dr. Rao</option>
                  <option>Dr. Kulkarni</option>
                </select>
              </label>
              <label>
                Date
                <input name="date" type="date" required />
              </label>
              <label>
                Time
                <input name="time" type="time" required />
              </label>
              <button className="primary-button form-submit" type="submit">
                Confirm appointment
              </button>
            </form>
          </section>
        ) : activePage === 'Overview' ? (
          <>
            <section className="welcome-row">
              <div>
                <h2>Good morning, Shravan</h2>
                <p>Here’s what’s happening at your clinic today.</p>
              </div>
              <button className="primary-button" onClick={() => setBookingOpen(true)}>
                + New appointment
              </button>
            </section>

            <section className="stat-grid">
              <article className="stat-card">
                <span className="stat-icon blue">▦</span>
                <p>Today’s appointments</p>
                <strong>{appointments.length}</strong>
                <small>Scheduled visits</small>
              </article>
              <article className="stat-card">
                <span className="stat-icon green">♙</span>
                <p>Patients in queue</p>
                <strong>{waitingAppointments.length}</strong>
                <small>Waiting to be seen</small>
              </article>
              <article className="stat-card">
                <span className="stat-icon orange">◷</span>
                <p>Upcoming follow-ups</p>
                <strong>5</strong>
                <small>Reminders to review</small>
              </article>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Today’s appointments</h2>
                  <p>Your latest scheduled visits</p>
                </div>
                <button className="text-button" onClick={() => setActivePage('Appointments')}>
                  View all
                </button>
              </div>

              <div className="appointment-list">
                {appointments.slice(0, 4).map((appointment) => (
                  <div className="appointment-row" key={appointment.id}>
                    <div className="time-badge">{appointment.time}</div>
                    <div className="patient-info">
                      <strong>{appointment.patient}</strong>
                      <span>{appointment.doctor}</span>
                      <span>
                        Token #{appointment.token} · Estimated wait: {appointment.wait} min
                      </span>
                    </div>
                    <span className={`status-pill ${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="content-card">
              <div className="section-heading">
                <div>
                  <h2>Queue preview</h2>
                  <p>Patients currently waiting</p>
                </div>
              </div>

              <div className="appointment-list">
                {waitingAppointments.length === 0 ? (
                  <p>No patients are waiting right now.</p>
                ) : (
                  waitingAppointments.map((appointment) => (
                    <div className="appointment-row" key={`queue-${appointment.id}`}>
                      <div className="time-badge">Token #{appointment.token}</div>
                      <div className="patient-info">
                        <strong>{appointment.patient}</strong>
                        <span>
                          {appointment.doctor} · Estimated wait: {appointment.wait} min
                        </span>
                      </div>
                      <span className="status-pill waiting">Waiting</span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        ) : activePage === 'Appointments' ? (
          <section className="content-card">
            <div className="section-heading">
              <div>
                <h2>Appointment list</h2>
                <p>Appointments currently shown in this demo.</p>
              </div>
              <button className="primary-button" onClick={() => setBookingOpen(true)}>
                + New appointment
              </button>
            </div>

            <div className="appointment-list">
              {appointments.map((appointment) => (
                <div className="appointment-row" key={appointment.id}>
                  <div className="time-badge">{appointment.time}</div>
                  <div className="patient-info">
                    <strong>{appointment.patient}</strong>
                    <span>{appointment.doctor}</span>
                    <span>
                      Token #{appointment.token} · Estimated wait: {appointment.wait} min
                    </span>
                  </div>
                  <span className={`status-pill ${appointment.status.toLowerCase()}`}>
                    {appointment.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="content-card coming-soon">
            <span className="stat-icon blue">✦</span>
            <h2>{activePage}</h2>
            <p>This section will be connected as the team builds its features.</p>
          </section>
        )}

        <p className="demo-note">
          Student project demo · Sample data only · Not connected to the database yet
        </p>
      </main>
    </div>
  )
}

export default App