"use client";

import { Download, FileSpreadsheet, MoreHorizontal, Plus, Search, Trash2, Upload, Users, X } from "lucide-react";
import Papa from "papaparse";
import { readSheet } from "read-excel-file/browser";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useWedding } from "@/components/WeddingProvider";

type ImportGuest = { name: string; phone: string; table: string };

const headerAliases = {
  name: ["name", "guest", "guestname", "fullname", "ឈ្មោះ", "ឈ្មោះភ្ញៀវ"],
  phone: ["phone", "phonenumber", "mobile", "tel", "លេខទូរស័ព្ទ", "ទូរស័ព្ទ"],
  table: ["table", "tablenumber", "table_number", "លេខតុ", "តុ"]
};

function normalizeHeader(value: unknown) {
  return String(value ?? "").trim().toLowerCase().replace(/[\s_-]+/g, "");
}

function readGuestRows(rows: unknown[][]): ImportGuest[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(normalizeHeader);
  const findColumn = (aliases: string[]) => headers.findIndex((header) => aliases.map(normalizeHeader).includes(header));
  const nameIndex = findColumn(headerAliases.name);
  const phoneIndex = findColumn(headerAliases.phone);
  const tableIndex = findColumn(headerAliases.table);
  if (nameIndex < 0) throw new Error("រកមិនឃើញជួរឈរ Name ឬ ឈ្មោះភ្ញៀវ");

  return rows.slice(1).map((row) => ({
    name: String(row[nameIndex] ?? "").trim(),
    phone: phoneIndex >= 0 ? String(row[phoneIndex] ?? "").trim() : "",
    table: tableIndex >= 0 ? String(row[tableIndex] ?? "").trim() : ""
  })).filter((guest) => guest.name);
}

export default function GuestsPage() {
  const { guests, addGuest, importGuests, removeGuest } = useWedding();
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importRows, setImportRows] = useState<ImportGuest[]>([]);
  const [importError, setImportError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const filtered = guests.filter((g) => `${g.name} ${g.phone} ${g.luckyId}`.toLowerCase().includes(query.toLowerCase()));

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addGuest({ name: String(data.get("name")), phone: String(data.get("phone")), table: String(data.get("table")) });
    event.currentTarget.reset();
    setShowForm(false);
  }

  async function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportRows([]);
    setImportError("");

    try {
      let rows: unknown[][];
      if (file.name.toLowerCase().endsWith(".csv")) {
        const result = Papa.parse<string[]>(await file.text(), { skipEmptyLines: true });
        if (result.errors.length) throw new Error(result.errors[0].message);
        rows = result.data;
      } else {
        rows = await readSheet(file);
      }
      const parsed = readGuestRows(rows);
      if (!parsed.length) throw new Error("មិនមានទិន្នន័យភ្ញៀវក្នុងឯកសារ");
      setImportRows(parsed);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "មិនអាចអានឯកសារបាន");
    }
  }

  function closeImport() {
    setShowImport(false);
    setImportRows([]);
    setImportError("");
    setFileName("");
  }

  function confirmImport() {
    importGuests(importRows);
    closeImport();
  }

  const headerAction = (
    <div className="header-actions">
      <button className="secondary-button" onClick={() => setShowImport(true)}><Upload size={17} /> នាំចូល Excel / CSV</button>
      <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={17} /> បន្ថែមភ្ញៀវ</button>
    </div>
  );

  return (
    <AdminShell title="បញ្ជីភ្ញៀវ" subtitle={`${guests.length} នាក់ · Manage invitations and RSVP`} action={headerAction}>
      <section className="guest-toolbar panel">
        <div className="search-box"><Search size={18} /><input placeholder="ស្វែងរកឈ្មោះ លេខទូរស័ព្ទ ឬ Lucky ID" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
        <div className="segmented"><button className="active">ទាំងអស់ {guests.length}</button><button>ចូលរួម {guests.filter(g => g.status === "attending").length}</button><button>រង់ចាំ {guests.filter(g => g.status === "pending").length}</button></div>
      </section>
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ភ្ញៀវ</th><th>លេខទូរស័ព្ទ</th><th>តុ</th><th>Lucky ID</th><th>ការឆ្លើយតប</th><th /></tr></thead>
            <tbody>{filtered.map((guest) => <tr key={guest.id}><td><span className="avatar">{guest.name.slice(0, 1)}</span><strong>{guest.name}</strong></td><td>{guest.phone || "—"}</td><td>{guest.table || "—"}</td><td><code>{guest.luckyId}</code></td><td><StatusBadge status={guest.status} /></td><td><button className="icon-button row-action" title="Delete guest" onClick={() => removeGuest(guest.id)}><Trash2 size={17} /></button></td></tr>)}</tbody>
          </table>
        </div>
        {!filtered.length && <div className="empty-state"><Users /><strong>{guests.length ? "រកមិនឃើញភ្ញៀវ" : "មិនទាន់មានភ្ញៀវ"}</strong><span>{guests.length ? "សូមសាកល្បងពាក្យស្វែងរកផ្សេងទៀត" : "បញ្ចូលភ្ញៀវម្នាក់ៗ ឬនាំចូលបញ្ជី Excel / CSV"}</span>{!guests.length && <button className="primary-button" onClick={() => setShowForm(true)}><Plus size={16} /> បន្ថែមភ្ញៀវដំបូង</button>}</div>}
      </section>
      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)}><form className="modal" onSubmit={submit} onClick={(e) => e.stopPropagation()}><div className="modal-title"><div><h2>បន្ថែមភ្ញៀវ</h2><p>Add a new guest invitation</p></div><button type="button" className="icon-button" onClick={() => setShowForm(false)}><MoreHorizontal /></button></div><label>ឈ្មោះភ្ញៀវ<input name="name" required autoFocus /></label><label>លេខទូរស័ព្ទ<input name="phone" /></label><label>លេខតុ<input name="table" /></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setShowForm(false)}>បោះបង់</button><button className="primary-button">បន្ថែម</button></div></form></div>}
      {showImport && (
        <div className="modal-backdrop" onClick={closeImport}>
          <div className="modal import-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-title">
              <div><h2>នាំចូលបញ្ជីភ្ញៀវ</h2><p>Import from Excel or CSV</p></div>
              <button type="button" className="icon-button" onClick={closeImport}><X size={19} /></button>
            </div>
            <button className="file-drop" type="button" onClick={() => fileInput.current?.click()}>
              <FileSpreadsheet size={30} />
              <strong>{fileName || "ជ្រើសរើសឯកសារ"}</strong>
              <span>Excel (.xlsx) ឬ CSV (.csv)</span>
            </button>
            <input ref={fileInput} className="hidden-file-input" type="file" accept=".xlsx,.csv" onChange={selectFile} />
            <div className="import-columns">
              <div><strong>ជួរឈរដែលទទួលស្គាល់</strong><a href="/guest-import-template.csv" download><Download size={13} /> ទាញយកគំរូ CSV</a></div>
              <span><code>name</code> ឬ <code>ឈ្មោះភ្ញៀវ</code> (ត្រូវការ)</span>
              <span><code>phone</code> ឬ <code>លេខទូរស័ព្ទ</code></span>
              <span><code>table</code> ឬ <code>លេខតុ</code></span>
            </div>
            {importError && <p className="import-error">{importError}</p>}
            {!!importRows.length && (
              <div className="import-preview">
                <div><strong>មើលជាមុន</strong><span>{importRows.length} ភ្ញៀវ</span></div>
                <div className="import-preview-rows">
                  {importRows.slice(0, 5).map((guest, index) => <div key={`${guest.name}-${index}`}><strong>{guest.name}</strong><span>{guest.phone || "គ្មានលេខទូរស័ព្ទ"} · តុ {guest.table || "—"}</span></div>)}
                  {importRows.length > 5 && <small>និង {importRows.length - 5} នាក់ទៀត...</small>}
                </div>
              </div>
            )}
            <div className="modal-actions">
              <button type="button" className="secondary-button" onClick={closeImport}>បោះបង់</button>
              <button type="button" className="primary-button" disabled={!importRows.length} onClick={confirmImport}><Upload size={16} /> នាំចូល {importRows.length || ""}</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
