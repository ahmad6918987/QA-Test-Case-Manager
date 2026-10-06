import { useEffect, useMemo, useState } from "react";

const emptyCase = {
  title: "",
  module: "",
  preconditions: "",
  steps: "",
  expected: "",
  actual: "",
  status: "Not Run",
  priority: "Medium",
  severity: "Medium",
};

const demoCases = [
  { id:"TC-001", title:"Valid user login", module:"Authentication", preconditions:"Registered user exists", steps:"1. Open login page\n2. Enter valid email and password\n3. Click Login", expected:"User is redirected to dashboard", actual:"", status:"Pass", priority:"High", severity:"Critical" },
  { id:"TC-002", title:"Required field validation", module:"Authentication", preconditions:"Login page is open", steps:"1. Leave email empty\n2. Click Login", expected:"A required-field validation message is shown", actual:"", status:"Not Run", priority:"Medium", severity:"Major" },
  { id:"TC-003", title:"Responsive dashboard layout", module:"Dashboard", preconditions:"User is logged in", steps:"1. Open dashboard\n2. Resize to mobile width", expected:"Content remains usable without horizontal overflow", actual:"", status:"Blocked", priority:"Low", severity:"Minor" }
];

function App() {
  const [cases, setCases] = useState(() => {
    try {
      const saved = localStorage.getItem("qa-test-cases");
      return saved ? JSON.parse(saved) : demoCases;
    } catch { return demoCases; }
  });
  const [form, setForm] = useState(emptyCase);
  const [editingId, setEditingId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("qa-test-cases", JSON.stringify(cases));
  }, [cases]);

  const filtered = useMemo(() => cases.filter(tc => {
    const text = [tc.id, tc.title, tc.module, tc.expected].join(" ").toLowerCase();
    return text.includes(query.toLowerCase()) &&
      (statusFilter === "All" || tc.status === statusFilter) &&
      (priorityFilter === "All" || tc.priority === priorityFilter);
  }), [cases, query, statusFilter, priorityFilter]);

  const stats = {
    total: cases.length,
    pass: cases.filter(x => x.status === "Pass").length,
    fail: cases.filter(x => x.status === "Fail").length,
    blocked: cases.filter(x => x.status === "Blocked").length,
    notRun: cases.filter(x => x.status === "Not Run").length,
  };

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setForm(emptyCase);
    setEditingId(null);
    setShowForm(false);
  }

  function saveCase(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.module.trim()) return;
    if (editingId) {
      setCases(prev => prev.map(tc => tc.id === editingId ? { ...form, id: editingId } : tc));
    } else {
      const next = cases.length + 1;
      setCases(prev => [...prev, { ...form, id: `TC-${String(next).padStart(3, "0")}` }]);
    }
    resetForm();
  }

  function editCase(tc) {
    setForm({ ...tc });
    setEditingId(tc.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteCase(id) {
    if (window.confirm("Delete this test case?")) setCases(prev => prev.filter(tc => tc.id !== id));
  }

  function exportCsv() {
    const headers = ["ID","Title","Module","Preconditions","Steps","Expected","Actual","Status","Priority","Severity"];
    const rows = cases.map(tc => headers.map(h => JSON.stringify(tc[h.toLowerCase()] ?? tc[h] ?? "")));
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qa-test-cases.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    if (window.confirm("Delete all test cases? This cannot be undone.")) setCases([]);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">QA PORTFOLIO PROJECT</span>
          <h1>Test Case Manager</h1>
          <p>Create, organize, execute and export software test cases.</p>
        </div>
        <button className="primary" onClick={() => { setEditingId(null); setForm(emptyCase); setShowForm(true); }}>
          + New Test Case
        </button>
      </header>

      <main className="container">
        <section className="stats-grid">
          <Stat label="Total Cases" value={stats.total} />
          <Stat label="Passed" value={stats.pass} tone="pass" />
          <Stat label="Failed" value={stats.fail} tone="fail" />
          <Stat label="Blocked" value={stats.blocked} tone="blocked" />
          <Stat label="Not Run" value={stats.notRun} tone="neutral" />
        </section>

        {showForm && (
          <section className="panel form-panel">
            <div className="section-heading">
              <div><h2>{editingId ? "Edit Test Case" : "Create Test Case"}</h2><p>Use a structured QA format so the case is ready for execution.</p></div>
              <button className="ghost" onClick={resetForm}>Close</button>
            </div>
            <form onSubmit={saveCase}>
              <div className="form-grid">
                <Field label="Title" value={form.title} onChange={v => update("title", v)} required />
                <Field label="Module / Feature" value={form.module} onChange={v => update("module", v)} required />
                <Field label="Priority" type="select" value={form.priority} onChange={v => update("priority", v)} options={["Low","Medium","High","Critical"]} />
                <Field label="Severity" type="select" value={form.severity} onChange={v => update("severity", v)} options={["Minor","Major","Critical","Blocker"]} />
                <Field label="Status" type="select" value={form.status} onChange={v => update("status", v)} options={["Not Run","Pass","Fail","Blocked"]} />
                <Field label="Preconditions" value={form.preconditions} onChange={v => update("preconditions", v)} />
                <Field label="Test Steps" value={form.steps} onChange={v => update("steps", v)} area />
                <Field label="Expected Result" value={form.expected} onChange={v => update("expected", v)} area />
                <Field label="Actual Result" value={form.actual} onChange={v => update("actual", v)} area />
              </div>
              <div className="form-actions"><button type="submit" className="primary">{editingId ? "Update Case" : "Save Test Case"}</button><button type="button" className="ghost" onClick={resetForm}>Cancel</button></div>
            </form>
          </section>
        )}

        <section className="panel">
          <div className="section-heading">
            <div><h2>Test Cases</h2><p>{filtered.length} case{filtered.length !== 1 ? "s" : ""} displayed</p></div>
            <div className="toolbar-actions"><button className="secondary" onClick={exportCsv}>Export CSV</button><button className="danger-outline" onClick={clearAll}>Clear All</button></div>
          </div>
          <div className="filters">
            <input placeholder="Search ID, title, module..." value={query} onChange={e => setQuery(e.target.value)} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All</option><option>Not Run</option><option>Pass</option><option>Fail</option><option>Blocked</option></select>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option>All</option><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
          </div>

          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Test Case</th><th>Module</th><th>Priority</th><th>Severity</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 ? <tr><td colSpan="7" className="empty">No test cases match your filters.</td></tr> :
                  filtered.map(tc => <tr key={tc.id}>
                    <td><strong>{tc.id}</strong></td>
                    <td><div className="case-title">{tc.title}</div><small>{tc.expected || "No expected result entered"}</small></td>
                    <td>{tc.module}</td>
                    <td><Badge value={tc.priority} /></td>
                    <td><Badge value={tc.severity} /></td>
                    <td><Badge value={tc.status} /></td>
                    <td><div className="row-actions"><button onClick={() => editCase(tc)}>Edit</button><button className="delete" onClick={() => deleteCase(tc.id)}>Delete</button></div></td>
                  </tr>)
                }
              </tbody>
            </table>
          </div>
        </section>
      </main>
      <footer>QA Test Case Manager • React + Vite • Data stored locally in your browser</footer>
    </div>
  );
}

function Stat({ label, value, tone="" }) {
  return <div className={`stat-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function Badge({ value }) {
  const key = value.toLowerCase().replace(/\s+/g, "-");
  return <span className={`badge ${key}`}>{value}</span>;
}

function Field({ label, value, onChange, type="text", options=[], area=false, required=false }) {
  return <label className={area ? "field full" : "field"}><span>{label}{required && " *"}</span>{type === "select" ? <select value={value} onChange={e => onChange(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select> : area ? <textarea rows="4" value={value} onChange={e => onChange(e.target.value)} /> : <input value={value} onChange={e => onChange(e.target.value)} required={required} />}</label>;
}

export default App;
