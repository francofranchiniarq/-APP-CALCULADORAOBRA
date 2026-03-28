import { useState, useEffect } from 'react';

/* ═══════════════════════════════════════════════════════════════
   Metriq — Leads / Analytics Panel
   Accessible at /admin route
   Shows all onboarding submissions stored in localStorage
   ═══════════════════════════════════════════════════════════════ */

function getLeads() {
  return JSON.parse(localStorage.getItem("metriq_leads") || "[]");
}

function countBy(arr, key) {
  const counts = {};
  arr.forEach((item) => {
    const val = item[key] || "N/A";
    counts[val] = (counts[val] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function countProblems(arr) {
  const counts = {};
  arr.forEach((item) => {
    (item.problems || []).forEach((p) => {
      counts[p] = (counts[p] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export default function LeadsPanel({ onBack }) {
  const [leads, setLeads] = useState([]);
  const [tab, setTab] = useState("overview"); // overview | leads | export

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const roleStats = countBy(leads, "role");
  const rubroStats = countBy(leads, "rubro");
  const scaleStats = countBy(leads, "scale");
  const problemStats = countProblems(leads);

  const exportCSV = () => {
    const headers = "Fecha,Email,Rol,Rubro,Problemas,Escala,Pantalla\n";
    const rows = leads.map((l) =>
      `${l.timestamp},${l.email},"${l.role}","${l.rubro}","${(l.problems || []).join("; ")}","${l.scale}",${l.screenWidth}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `metriq-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLeads = () => {
    if (window.confirm("¿Borrar todos los leads? Esta acción no se puede deshacer.")) {
      localStorage.removeItem("metriq_leads");
      setLeads([]);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#131210", color: "#F0EBE3",
      padding: "24px", fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <button onClick={onBack} style={{
            background: "none", border: "none", color: "#A09C96", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 8,
          }}>← Volver al dashboard</button>
          <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1, margin: 0 }}>
            Panel de Leads
          </h1>
          <p style={{ color: "#6B7280", fontSize: 14, margin: "4px 0 0" }}>
            {leads.length} registro{leads.length !== 1 ? "s" : ""} capturado{leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={{
            padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)", color: "#F0EBE3", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
          }}>Exportar CSV</button>
          <button onClick={clearLeads} style={{
            padding: "8px 16px", borderRadius: 10, border: "1px solid rgba(207,48,85,0.2)",
            background: "rgba(207,48,85,0.08)", color: "#CF3055", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700,
          }}>Limpiar datos</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {["overview", "leads"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700,
            background: tab === t ? "#CF3055" : "rgba(255,255,255,0.04)",
            color: tab === t ? "#fff" : "#A09C96",
          }}>
            {t === "overview" ? "Resumen" : "Todos los leads"}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {/* Total leads */}
          <StatCard title="Total registros" value={leads.length} />

          {/* By role */}
          <BreakdownCard title="Por rol" data={roleStats} total={leads.length} />

          {/* By rubro */}
          <BreakdownCard title="Por rubro" data={rubroStats} total={leads.length} />

          {/* By scale */}
          <BreakdownCard title="Por volumen" data={scaleStats} total={leads.length} />

          {/* Top problems */}
          <BreakdownCard title="Problemas más frecuentes" data={problemStats.slice(0, 6)} total={leads.length} wide />

          {/* Devices */}
          <BreakdownCard
            title="Dispositivo"
            data={countBy(leads.map((l) => ({
              ...l,
              device: (l.screenWidth || 0) < 768 ? "Mobile" : "Desktop",
            })), "device")}
            total={leads.length}
          />
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.02)", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "180px 1fr 120px 140px 80px",
            padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 11, fontWeight: 800, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5,
          }}>
            <span>Fecha</span><span>Email</span><span>Rol</span><span>Rubro</span><span>Escala</span>
          </div>
          {leads.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#4A4A4E", fontSize: 14 }}>
              No hay registros todavía. Los datos aparecerán cuando alguien complete el onboarding.
            </div>
          ) : (
            leads.slice().reverse().map((l, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "180px 1fr 120px 140px 80px",
                padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.03)",
                fontSize: 13, color: "#A09C96", alignItems: "center",
              }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>
                  {new Date(l.timestamp).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ color: "#F0EBE3", fontWeight: 600 }}>{l.email}</span>
                <span>{l.role || "—"}</span>
                <span>{l.rubro || "—"}</span>
                <span>{l.scale || "—"}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: 28,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, fontFamily: "'JetBrains Mono', monospace", color: "#CF3055" }}>{value}</div>
    </div>
  );
}

function BreakdownCard({ title, data, total, wide }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: 24, gridColumn: wide ? "span 2" : undefined,
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>{title}</div>
      {data.length === 0 ? (
        <div style={{ color: "#4A4A4E", fontSize: 13 }}>Sin datos</div>
      ) : (
        data.map(([key, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#F0EBE3" }}>{key}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#A09C96", fontFamily: "'JetBrains Mono', monospace" }}>{count} ({pct}%)</span>
              </div>
              <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)" }}>
                <div style={{ height: "100%", borderRadius: 4, background: "#CF3055", width: `${pct}%`, transition: "width 0.5s" }} />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
