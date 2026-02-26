import { useState } from "react";

const STEPS = ["Define Cohort", "Explore & Analyze", "Export"];

const FIELD_CATEGORIES = {
  "Patient Demographics": [
    { id: "age", label: "Age", code: "KL_1003" },
    { id: "age_class", label: "Age Group", code: "KL_2387" },
    { id: "birth_year", label: "Year of Birth", code: "KL_112" },
  ],
  "Diagnosis": [
    { id: "main_diag", label: "Primary Diagnosis", code: "I01" },
    { id: "tumor_stage", label: "Tumor Stage (T)", code: "I05" },
    { id: "her2", label: "HER2 Status", code: "OP_559" },
  ],
  "Surgery": [
    { id: "op_type", label: "Type of First Oncological Breast Surgery", code: "E08" },
    { id: "resection", label: "Resection Status (R)", code: "E12" },
    { id: "patient_operated", label: "Patient Operated", code: "N00" },
  ],
  "Clarification & Referral": [
    { id: "ext_clarification", label: "External Clarification", code: "KL_2843" },
    { id: "ext_clarification_copy", label: "External Clarification (Copy A0→A1)", code: "OP_16319" },
  ],
};

const OPERATORS = ["is", "is not", "contains", "greater than", "less than"];

const VALUE_OPTIONS = {
  ext_clarification: ["Yes", "No"],
  patient_operated: ["Yes", "No", "Yes, but externally"],
  op_type: ["Breast-conserving", "Mastectomy", "Mastectomy with reconstruction", "Other"],
  resection: ["R0", "R1", "R2"],
  main_diag: ["Invasive carcinoma", "In situ carcinoma", "No carcinoma"],
  tumor_stage: ["Tis", "T1", "T2", "T3", "T4"],
  her2: ["Positive", "Negative", "Equivocal"],
};

const SAMPLE_CASES = [
  { nr: 1, pid: "8██", date: "03.02.2025", birthYear: 1965, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Breast-conserving", resection: "R0", stage: "T1" },
  { nr: 2, pid: "7██", date: "06.02.2025", birthYear: 1972, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Mastectomy", resection: "R0", stage: "T2" },
  { nr: 3, pid: "5██", date: "20.02.2025", birthYear: 1978, clinic: 1742, diagnosis: "In situ carcinoma", surgery: "Breast-conserving", resection: "R0", stage: "Tis" },
  { nr: 4, pid: "9██", date: "14.01.2025", birthYear: 1960, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Breast-conserving", resection: "R1", stage: "T2" },
  { nr: 5, pid: "3██", date: "28.01.2025", birthYear: 1985, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Mastectomy with reconstruction", resection: "R0", stage: "T3" },
  { nr: 6, pid: "6██", date: "11.03.2025", birthYear: 1969, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Breast-conserving", resection: "R0", stage: "T1" },
  { nr: 7, pid: "4██", date: "22.03.2025", birthYear: 1991, clinic: 1742, diagnosis: "No carcinoma", surgery: "Breast-conserving", resection: "R0", stage: "T1" },
  { nr: 8, pid: "2██", date: "05.04.2025", birthYear: 1954, clinic: 1742, diagnosis: "Invasive carcinoma", surgery: "Breast-conserving", resection: "R0", stage: "T1" },
];

const SAVED_FILTERS = [
  { id: 1, name: "R0 Resections 2025", description: "All cases with R0 resection status in 2025", author: "C. Völkle", date: "15.01.2025", starred: true },
  { id: 2, name: "EUSOMA / DKG / SBCDB Cases", description: "Cases matching EUSOMA, DKG, or SBCDB selection criteria", author: "Adjumed", date: "07.05.2015", starred: false },
  { id: 3, name: "Externally Clarified Cases", description: "All cases with external clarification = true", author: "C. Völkle", date: "04.02.2025", starred: true },
  { id: 4, name: "Mastectomy Cases T2+", description: "Mastectomy patients with tumor stage T2 or higher", author: "C. Völkle", date: "22.12.2024", starred: false },
];

const EXPORT_FIELD_GROUPS = {
  "Patient Info": ["PID", "Date of First Consultation", "Year of Birth", "Age", "Age Group"],
  "Diagnosis": ["Primary Diagnosis", "Tumor Stage (T)", "HER2 Status", "Grading"],
  "Surgery": ["Surgery Type", "Resection Status", "Patient Operated", "Number of Operations"],
  "Clarification": ["External Clarification", "Date Changed"],
};

// Icons as simple SVG components
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
);
const Search = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
);
const Plus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
);
const X = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
);
const Star = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#E8A838" : "none"} stroke={filled ? "#E8A838" : "currentColor"} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);
const Download = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
);
const Folder = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
);
const Check = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const BarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="2" width="4" height="19"/></svg>
);

function FilterRow({ filter, onRemove, onUpdate }) {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
      <select
        value={filter.field}
        onChange={(e) => onUpdate({ ...filter, field: e.target.value, value: "" })}
        style={selectStyle}
      >
        <option value="">Select field...</option>
        {Object.entries(FIELD_CATEGORIES).map(([cat, fields]) => (
          <optgroup key={cat} label={cat}>
            {fields.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
          </optgroup>
        ))}
      </select>

      <select value={filter.operator} onChange={(e) => onUpdate({ ...filter, operator: e.target.value })} style={{ ...selectStyle, width: 130 }}>
        {OPERATORS.map((op) => <option key={op} value={op}>{op}</option>)}
      </select>

      {VALUE_OPTIONS[filter.field] ? (
        <select value={filter.value} onChange={(e) => onUpdate({ ...filter, value: e.target.value })} style={{ ...selectStyle, flex: 1 }}>
          <option value="">Select value...</option>
          {VALUE_OPTIONS[filter.field].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      ) : (
        <input
          type="text"
          placeholder="Enter value..."
          value={filter.value}
          onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
          style={{ ...inputStyle, flex: 1 }}
        />
      )}

      <button onClick={onRemove} style={iconBtnStyle} title="Remove filter">
        <X />
      </button>
    </div>
  );
}

function KPICard({ label, value, sub, color }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e8eaed",
      borderRadius: 10,
      padding: "18px 22px",
      flex: 1,
      minWidth: 140,
      borderTop: `3px solid ${color || "#4A90D9"}`,
    }}>
      <div style={{ fontSize: 11, fontFamily: "'DM Sans', sans-serif", color: "#7a8599", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400, color: "#1a2332" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#7a8599", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function MiniBar({ data, colors }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 100, fontSize: 12, color: "#5a6577", textAlign: "right", flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>{d.label}</div>
          <div style={{ flex: 1, height: 22, background: "#f4f5f7", borderRadius: 4, overflow: "hidden", cursor: "pointer", position: "relative" }}
            title={`Click to filter: ${d.label}`}
          >
            <div style={{
              width: `${(d.value / max) * 100}%`,
              height: "100%",
              background: colors?.[i] || "#4A90D9",
              borderRadius: 4,
              transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 8,
            }}>
              <span style={{ fontSize: 11, color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{d.value}</span>
            </div>
          </div>
          <div style={{ width: 42, fontSize: 11, color: "#7a8599", fontFamily: "'DM Mono', monospace" }}>{d.pct}%</div>
        </div>
      ))}
    </div>
  );
}

export default function AdjumedRedesign() {
  const [step, setStep] = useState(0);
  const [filters, setFilters] = useState([
    { id: 1, field: "ext_clarification", operator: "is", value: "Yes" },
  ]);
  const [years, setYears] = useState([2025]);
  const [showSaved, setShowSaved] = useState(false);
  const [fieldSearch, setFieldSearch] = useState("");
  const [exportFields, setExportFields] = useState(["PID", "Date of First Consultation", "Year of Birth", "Primary Diagnosis", "Surgery Type", "Resection Status"]);
  const [selectedCases, setSelectedCases] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});

  const addFilter = () => {
    setFilters([...filters, { id: Date.now(), field: "", operator: "is", value: "" }]);
  };

  const removeFilter = (id) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (id, newFilter) => {
    setFilters(filters.map((f) => (f.id === id ? { ...newFilter, id } : f)));
  };

  const toggleYear = (y) => {
    setYears(years.includes(y) ? years.filter((yr) => yr !== y) : [...years, y]);
  };

  const toggleExportField = (field) => {
    setExportFields(exportFields.includes(field) ? exportFields.filter((f) => f !== field) : [...exportFields, field]);
  };

  const toggleAllGroup = (fields) => {
    const allSelected = fields.every((f) => exportFields.includes(f));
    if (allSelected) {
      setExportFields(exportFields.filter((f) => !fields.includes(f)));
    } else {
      setExportFields([...new Set([...exportFields, ...fields])]);
    }
  };

  const totalCases = step === 0 ? 74 : SAMPLE_CASES.length;
  const activeFilters = filters.filter((f) => f.field && f.value);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f7f8fa", minHeight: "100vh", color: "#1a2332" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Instrument+Serif&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "#0f2b4a",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: "#fff", fontSize: 18, fontWeight: 700, letterSpacing: "0.08em" }}>ADJUMED</span>
          <span style={{ color: "#6AAEE6", fontSize: 14, fontWeight: 500 }}>ANALYZE</span>
          <span style={{ color: "#3d6b96", fontSize: 13, margin: "0 8px" }}>|</span>
          <span style={{ color: "#8ab4d8", fontSize: 13 }}>Clinic 1742</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: "#8ab4d8", fontSize: 13 }}>
          <span>Curtis Völkle</span>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#1d4872", display: "flex", alignItems: "center", justifyContent: "center", color: "#6AAEE6", fontSize: 12, fontWeight: 600 }}>CV</div>
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e8eaed",
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        height: 52,
      }}>
        {STEPS.map((s, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "0 24px",
              height: "100%",
              cursor: "pointer",
              borderBottom: step === i ? "2px solid #4A90D9" : "2px solid transparent",
              transition: "all 0.2s",
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              background: step === i ? "#4A90D9" : i < step ? "#34C17B" : "#e0e4ea",
              color: "#fff", fontSize: 12, fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s",
            }}>
              {i < step ? <Check /> : i + 1}
            </div>
            <span style={{
              fontSize: 13, fontWeight: step === i ? 600 : 400,
              color: step === i ? "#1a2332" : "#7a8599",
            }}>{s}</span>
            {i < STEPS.length - 1 && (
              <div style={{ width: 32, height: 1, background: "#e0e4ea", marginLeft: 14 }} />
            )}
          </div>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} style={secondaryBtnStyle}>Back</button>
          )}
          {step < 2 && (
            <button onClick={() => setStep(step + 1)} style={primaryBtnStyle}>
              {step === 0 ? `Show ${totalCases} Cases` : "Export"}
              <ChevronRight />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: "24px 32px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ===== STEP 1: DEFINE COHORT ===== */}
        {step === 0 && (
          <div style={{ display: "flex", gap: 24 }}>
            {/* Left: Filters */}
            <div style={{ flex: 1 }}>
              {/* Quick access */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <button onClick={() => setShowSaved(!showSaved)} style={{ ...secondaryBtnStyle, display: "flex", alignItems: "center", gap: 6 }}>
                  <Folder /> Saved Filters
                </button>
              </div>

              {showSaved && (
                <div style={cardStyle}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <Folder /> Saved Filter Sets
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {SAVED_FILTERS.map((sf) => (
                      <div key={sf.id} style={{
                        padding: "12px 14px",
                        background: "#f9fafb",
                        borderRadius: 8,
                        border: "1px solid #eef0f3",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = "#4A90D9"}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = "#eef0f3"}
                      >
                        <div style={{ marginTop: 2, cursor: "pointer", flexShrink: 0 }}>
                          <Star filled={sf.starred} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1a2332" }}>{sf.name}</div>
                          <div style={{ fontSize: 12, color: "#7a8599", marginTop: 2 }}>{sf.description}</div>
                          <div style={{ fontSize: 11, color: "#a0a9b8", marginTop: 4 }}>{sf.author} · {sf.date}</div>
                        </div>
                        <button style={{ ...secondaryBtnSmallStyle, flexShrink: 0 }}>Load</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Year Selection */}
              <div style={cardStyle}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Time Period</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[2025, 2024, 2023, 2022, 2021].map((y) => (
                    <button
                      key={y}
                      onClick={() => toggleYear(y)}
                      style={{
                        padding: "6px 16px",
                        borderRadius: 20,
                        border: years.includes(y) ? "1.5px solid #4A90D9" : "1.5px solid #dde0e6",
                        background: years.includes(y) ? "#EBF3FC" : "#fff",
                        color: years.includes(y) ? "#2B6CB0" : "#5a6577",
                        fontSize: 13,
                        fontWeight: years.includes(y) ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Filters</div>
                  <div style={{ fontSize: 12, color: "#7a8599" }}>
                    {activeFilters.length > 0 && `${activeFilters.length} active`}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#7a8599", marginBottom: 12 }}>
                  Show cases where...
                </div>
                {filters.map((f) => (
                  <FilterRow
                    key={f.id}
                    filter={f}
                    onRemove={() => removeFilter(f.id)}
                    onUpdate={(nf) => updateFilter(f.id, nf)}
                  />
                ))}
                <button onClick={addFilter} style={{ ...textBtnStyle, marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                  <Plus /> Add condition
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button style={secondaryBtnStyle}>Save Filter Set</button>
                <button style={textBtnStyle} onClick={() => setFilters([])}>Clear All</button>
              </div>
            </div>

            {/* Right: Preview */}
            <div style={{ width: 340 }}>
              <div style={{
                ...cardStyle,
                background: "linear-gradient(135deg, #0f2b4a 0%, #1d4872 100%)",
                color: "#fff",
                border: "none",
              }}>
                <div style={{ fontSize: 12, opacity: 0.6, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Live Preview</div>
                <div style={{ fontSize: 42, fontFamily: "'Instrument Serif', Georgia, serif", fontWeight: 400 }}>74</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>matching cases</div>
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.15)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ opacity: 0.6 }}>Tumors</span><span>75</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ opacity: 0.6 }}>R0 Resections</span><span>39</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ opacity: 0.6 }}>R1 Resections</span><span>2</span>
                  </div>
                </div>
              </div>

              <div style={{ ...cardStyle, marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#7a8599", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Active Filters</div>
                {activeFilters.length === 0 ? (
                  <div style={{ fontSize: 13, color: "#a0a9b8", fontStyle: "italic" }}>No filters applied — showing all cases</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {activeFilters.map((f) => {
                      const fieldLabel = Object.values(FIELD_CATEGORIES).flat().find((fi) => fi.id === f.field)?.label || f.field;
                      return (
                        <div key={f.id} style={{
                          padding: "6px 10px",
                          background: "#EBF3FC",
                          borderRadius: 6,
                          fontSize: 12,
                          color: "#2B6CB0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}>
                          <span><strong>{fieldLabel}</strong> {f.operator} {f.value}</span>
                          <button onClick={() => removeFilter(f.id)} style={{ ...iconBtnSmallStyle, color: "#2B6CB0" }}><X /></button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2: EXPLORE & ANALYZE ===== */}
        {step === 1 && (
          <div>
            {/* KPI Row */}
            <div style={{ display: "flex", gap: 14, marginBottom: 24 }}>
              <KPICard label="Total Cases" value="74" sub="2025" color="#4A90D9" />
              <KPICard label="R0 Resections" value="39" sub="52.7% of cases" color="#34C17B" />
              <KPICard label="Median Age" value="58" sub="Range: 29–87" color="#E8A838" />
              <KPICard label="Operated" value="66" sub="88.7% of cases" color="#7C6EE7" />
            </div>

            {/* Charts Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Primary Diagnosis</div>
                <MiniBar
                  data={[
                    { label: "Invasive ca.", value: 67, pct: "90.4" },
                    { label: "In situ ca.", value: 4, pct: "5.8" },
                    { label: "No carcinoma", value: 3, pct: "3.9" },
                  ]}
                  colors={["#4A90D9", "#6AAEE6", "#A8CEF0"]}
                />
                <div style={{ fontSize: 11, color: "#a0a9b8", marginTop: 10, fontStyle: "italic" }}>Click any bar to filter</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Surgery Type</div>
                <MiniBar
                  data={[
                    { label: "Breast-cons.", value: 58, pct: "78.7" },
                    { label: "Mastectomy", value: 8, pct: "10.6" },
                    { label: "Mast. + recon.", value: 6, pct: "8.5" },
                    { label: "Other", value: 2, pct: "2.1" },
                  ]}
                  colors={["#34C17B", "#5DD9A0", "#8AE6BE", "#C0F0DB"]}
                />
                <div style={{ fontSize: 11, color: "#a0a9b8", marginTop: 10, fontStyle: "italic" }}>Click any bar to filter</div>
              </div>
              <div style={cardStyle}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Tumor Stage</div>
                <MiniBar
                  data={[
                    { label: "Tis", value: 4, pct: "5.4" },
                    { label: "T1", value: 28, pct: "37.8" },
                    { label: "T2", value: 10, pct: "13.5" },
                    { label: "T3", value: 2, pct: "2.7" },
                  ]}
                  colors={["#E8A838", "#F0BE5C", "#F5D488", "#FAE8B8"]}
                />
                <div style={{ fontSize: 11, color: "#a0a9b8", marginTop: 10, fontStyle: "italic" }}>Click any bar to filter</div>
              </div>
            </div>

            {/* Cases Table */}
            <div style={cardStyle}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Individual Cases</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ position: "relative" }}>
                    <input placeholder="Search cases..." style={{ ...inputStyle, width: 200, paddingLeft: 32 }} />
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a0a9b8" }}><Search /></span>
                  </div>
                  <button onClick={() => setStep(2)} style={{ ...primaryBtnStyle, fontSize: 13 }}><Download /> Export</button>
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e8eaed" }}>
                      {["Nr.", "PID", "Date", "Birth Year", "Diagnosis", "Surgery", "Resection", "Stage"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#7a8599", fontWeight: 500, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.03em" }}>{h}</th>
                      ))}
                      <th style={{ width: 40 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {SAMPLE_CASES.map((c, i) => (
                      <tr key={c.nr} style={{ borderBottom: "1px solid #f4f5f7", cursor: "pointer", transition: "background 0.1s" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={cellStyle}>{c.nr}</td>
                        <td style={{ ...cellStyle, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{c.pid}</td>
                        <td style={cellStyle}>{c.date}</td>
                        <td style={cellStyle}>{c.birthYear}</td>
                        <td style={cellStyle}>{c.diagnosis}</td>
                        <td style={cellStyle}>{c.surgery}</td>
                        <td style={cellStyle}>
                          <span style={{
                            padding: "2px 8px",
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 600,
                            background: c.resection === "R0" ? "#E8F8EF" : "#FFF3E0",
                            color: c.resection === "R0" ? "#1B8A4A" : "#C67600",
                          }}>{c.resection}</span>
                        </td>
                        <td style={cellStyle}>{c.stage}</td>
                        <td style={{ ...cellStyle, color: "#4A90D9", fontWeight: 500, fontSize: 12 }}>Edit</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "#7a8599" }}>Showing 8 of 74 cases</div>
            </div>
          </div>
        )}

        {/* ===== STEP 3: EXPORT ===== */}
        {step === 2 && (
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Select Fields to Export</div>
                <div style={{ fontSize: 12, color: "#7a8599", marginBottom: 16 }}>Choose which data points to include in your export file.</div>

                <div style={{ position: "relative", marginBottom: 16 }}>
                  <input
                    placeholder="Search fields..."
                    value={fieldSearch}
                    onChange={(e) => setFieldSearch(e.target.value)}
                    style={{ ...inputStyle, width: "100%", paddingLeft: 32 }}
                  />
                  <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#a0a9b8" }}><Search /></span>
                </div>

                {Object.entries(EXPORT_FIELD_GROUPS).map(([group, fields]) => {
                  const filteredFields = fields.filter((f) => !fieldSearch || f.toLowerCase().includes(fieldSearch.toLowerCase()));
                  if (filteredFields.length === 0) return null;
                  const allSelected = filteredFields.every((f) => exportFields.includes(f));

                  return (
                    <div key={group} style={{ marginBottom: 16 }}>
                      <div
                        style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}
                        onClick={() => toggleAllGroup(filteredFields)}
                      >
                        <div style={{
                          width: 18, height: 18, borderRadius: 4,
                          border: allSelected ? "none" : "1.5px solid #c4cad4",
                          background: allSelected ? "#4A90D9" : "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {allSelected && <Check />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#1a2332" }}>{group}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingLeft: 26 }}>
                        {filteredFields.map((f) => {
                          const selected = exportFields.includes(f);
                          return (
                            <button
                              key={f}
                              onClick={() => toggleExportField(f)}
                              style={{
                                padding: "5px 12px",
                                borderRadius: 6,
                                border: selected ? "1.5px solid #4A90D9" : "1.5px solid #dde0e6",
                                background: selected ? "#EBF3FC" : "#fff",
                                color: selected ? "#2B6CB0" : "#5a6577",
                                fontSize: 12,
                                cursor: "pointer",
                                transition: "all 0.15s",
                                fontFamily: "'DM Sans', sans-serif",
                              }}
                            >
                              {selected && <span style={{ marginRight: 4 }}>✓</span>}
                              {f}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Export preview */}
            <div style={{ width: 340 }}>
              <div style={cardStyle}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Export Summary</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#7a8599" }}>Cases</span><span style={{ fontWeight: 600 }}>74</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#7a8599" }}>Fields</span><span style={{ fontWeight: 600 }}>{exportFields.length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "#7a8599" }}>Filters</span><span style={{ fontWeight: 600 }}>1 active</span>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "#7a8599", marginBottom: 8 }}>Selected fields:</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 20 }}>
                  {exportFields.map((f) => (
                    <span key={f} style={{
                      padding: "3px 8px",
                      background: "#f4f5f7",
                      borderRadius: 4,
                      fontSize: 11,
                      color: "#5a6577",
                    }}>{f}</span>
                  ))}
                </div>

                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Format</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {["Excel (.xlsx)", "CSV", "PDF"].map((fmt, i) => (
                    <button key={fmt} style={{
                      padding: "8px 16px",
                      borderRadius: 8,
                      border: i === 0 ? "1.5px solid #4A90D9" : "1.5px solid #dde0e6",
                      background: i === 0 ? "#EBF3FC" : "#fff",
                      color: i === 0 ? "#2B6CB0" : "#5a6577",
                      fontSize: 13,
                      fontWeight: i === 0 ? 600 : 400,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{fmt}</button>
                  ))}
                </div>

                <button style={{
                  ...primaryBtnStyle,
                  width: "100%",
                  justifyContent: "center",
                  padding: "12px 20px",
                  fontSize: 14,
                }}>
                  <Download /> Download Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== STYLES =====
const cardStyle = {
  background: "#fff",
  border: "1px solid #e8eaed",
  borderRadius: 12,
  padding: "20px 22px",
  marginBottom: 16,
};

const selectStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1.5px solid #dde0e6",
  background: "#fff",
  fontSize: 13,
  color: "#1a2332",
  fontFamily: "'DM Sans', sans-serif",
  cursor: "pointer",
  outline: "none",
  minWidth: 160,
};

const inputStyle = {
  padding: "8px 12px",
  borderRadius: 8,
  border: "1.5px solid #dde0e6",
  background: "#fff",
  fontSize: 13,
  color: "#1a2332",
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
};

const primaryBtnStyle = {
  padding: "8px 18px",
  borderRadius: 8,
  border: "none",
  background: "#4A90D9",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 6,
  transition: "background 0.15s",
};

const secondaryBtnStyle = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1.5px solid #dde0e6",
  background: "#fff",
  color: "#5a6577",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const secondaryBtnSmallStyle = {
  padding: "4px 10px",
  borderRadius: 6,
  border: "1.5px solid #dde0e6",
  background: "#fff",
  color: "#5a6577",
  fontSize: 11,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
};

const textBtnStyle = {
  padding: "8px 12px",
  border: "none",
  background: "none",
  color: "#4A90D9",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif",
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const iconBtnStyle = {
  width: 30, height: 30,
  borderRadius: 6,
  border: "none",
  background: "none",
  color: "#a0a9b8",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const iconBtnSmallStyle = {
  border: "none",
  background: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  padding: 2,
};

const cellStyle = {
  padding: "10px 12px",
};
