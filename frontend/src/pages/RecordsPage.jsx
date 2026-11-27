import React, { useState } from "react";

const SAMPLE_RECORDS = [
  {
    id: 1,
    title: "Complete Blood Count (Sample)",
    type: "Test Result",
    date: "2026-10-12",
    fileName: "sample-cbc-report.pdf",
  },
  {
    id: 2,
    title: "General Checkup Prescription (Sample)",
    type: "Prescription",
    date: "2026-11-02",
    fileName: "sample-prescription.pdf",
  },
];

export default function RecordsPage() {
  const [records, setRecords] = useState(SAMPLE_RECORDS);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("Prescription");
  const [docDate, setDocDate] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!title.trim() || !docDate) return;

    const newRecord = {
      id: Date.now(),
      title: title.trim(),
      type: docType,
      date: docDate,
      fileName: selectedFile ? selectedFile.name : "sample-document.pdf",
    };

    setRecords((prev) => [newRecord, ...prev]);
    setTitle("");
    setDocDate("");
    setSelectedFile(null);
    e.target.reset();
  };

  const filteredRecords = records.filter((rec) => {
    const q = searchQuery.toLowerCase();
    return (
      rec.title.toLowerCase().includes(q) ||
      rec.type.toLowerCase().includes(q) ||
      rec.fileName.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ padding: "1.5rem", maxWidth: "800px" }}>
      <h2>Medical Records</h2>

      <form onSubmit={handleAddRecord} style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <label>
          Document Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Sample X-Ray Summary"
            required
          />
        </label>

        <label>
          Document Type
          <select value={docType} onChange={(e) => setDocType(e.target.value)}>
            <option value="Prescription">Prescription</option>
            <option value="Test Result">Test Result</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Consultation Note">Consultation Note</option>
          </select>
        </label>

        <label>
          Document Date
          <input
            type="date"
            value={docDate}
            onChange={(e) => setDocDate(e.target.value)}
            required
          />
        </label>

        <label>
          Select File (Sample only)
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
        </label>

        <button type="submit">Add Sample Document</button>
      </form>

      <div style={{ marginBottom: "1rem" }}>
        <label>
          Search Records{" "}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, type, or file..."
          />
        </label>
      </div>

      <ul>
        {filteredRecords.map((rec) => (
          <li key={rec.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{rec.title}</strong> — {rec.type} ({rec.date}) · <em>{rec.fileName}</em>
          </li>
        ))}
        {filteredRecords.length === 0 && <li>No matching sample records found.</li>}
      </ul>
    </div>
  );
}