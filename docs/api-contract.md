# MediFlow Connection Plan — Draft

## Appointment
patient_id, patient_name, phone, appointment_time, reason, status

## Queue token
token_number, appointment_id, queue_status, estimated_wait_minutes

## Medical document
patient_id, document_title, document_type, document_date

## Follow-up
patient_id, due_date, note, reminder_status

## Planned backend routes
GET /api/health
POST /api/appointments
GET /api/queue