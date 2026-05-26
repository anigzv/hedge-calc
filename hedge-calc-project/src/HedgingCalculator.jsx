import { useState, useMemo } from "react";

const PAIRS = {
  "XAUUSD": { pipUSD: 1, label: "XAUUSD (Oro)" },
  "EURUSD": { pipUSD: 10, label: "EURUSD" },
  "GBPUSD": { pipUSD: 10, label: "GBPUSD" },
  "USDJPY": { pipUSD: 6.5, label: "USDJPY" },
  "AUDUSD": { pipUSD: 10, label: "AUDUSD" },
  "NZDUSD": { pipUSD: 10, label: "NZDUSD" },
  "USDCAD": { pipUSD: 7.5, label: "USDCAD" },
  "USDCHF": { pipUSD: 11, label: "USDCHF" },
  "US30": { pipUSD: 1, label: "US30 (Dow Jones)" },
  "NAS100": { pipUSD: 1, label: "NAS100 (Nasdaq)" },
  "SPX500": { pipUSD: 1, label: "SPX500 (S&P 500)" },
};

const fmt = (n) => (n < 0 ? `-$${Math.abs(n).toFixed(2)}` : `$${n.toFixed(2)}`);

export default function HedgingCalculator() {
  // Challenge config
  const [challengeCost, setChallengeCost] = useState(66);
  const [currentEquity, setCurrentEquity] = useState(9700);
  const [maxLossRemaining, setMaxLossRemaining] = useState(754.59);
  const [profitTarget, setProfitTarget] = useState(800);
  const [riskPercent, setRiskPercent] = useState(0.5);
  const [rr, setRr] = useState(2);

  // Phase 2 config
  const [p2Capital, setP2Capital] = useState(10000);
  const [p2MaxLoss, setP2MaxLoss] = useState(6);
  const [p2Target, setP2Target] = useState(6);

  // Trade setup
  const [pair, setPair] = useState("XAUUSD");
  const [slPips, setSlPips] = useState(50);

  // UI
  const [activeTab, setActiveTab] = useState("calc");
  const [activePhase, setActivePhase] = useState("f1");

  const phase1 = useMemo(() => {
    const risk = currentEquity * (riskPercent / 100);
    const tp = risk * rr;
    const rToDrawdown = maxLossRemaining / risk;
    const rToTarget = profitTarget / tp;
    const coveragePerR = challengeCost / rToDrawdown;
    const pairData = PAIRS[pair];
    const lotF = risk / (slPips * pairData.pipUSD);
    const lotE = coveragePerR / (slPips * pairData.pipUSD);
    const lossIfPass = rToTarget * coveragePerR;

    return {
      risk, tp, rToDrawdown, rToTarget, coveragePerR,
      lotF: Math.round(lotF * 100) / 100,
      lotE: Math.round(lotE * 100) / 100,
      lossIfPass,
      lossPerTradeWin: coveragePerR * rr,
      gainPerTradeLoss: coveragePerR,
    };
  }, [currentEquity, riskPercent, rr, maxLossRemaining, profitTarget, challengeCost, pair, slPips]);

  const phase2 = useMemo(() => {
    const investedTotal = challengeCost + phase1.lossIfPass;
    const risk = p2Capital * (riskPercent / 100);
    const tp = risk * rr;
    const maxDD = p2Capital * (p2MaxLoss / 100);
    const target = p2Capital * (p2Target / 100);
    const rToDrawdown = maxDD / risk;
    const rToTarget = target / tp;
    const coveragePerR = investedTotal / rToDrawdown;
    const pairData = PAIRS[pair];
    const lotF = risk / (slPips * pairData.pipUSD);
    const lotE = coveragePerR / (slPips * pairData.pipUSD);
    const lossIfPass = rToTarget * coveragePerR;

    return {
      investedTotal, risk, tp, maxDD, target,
      rToDrawdown, rToTarget, coveragePerR,
      lotF: Math.round(lotF * 100) / 100,
      lotE: Math.round(lotE * 100) / 100,
      lossIfPass,
      lossPerTradeWin: coveragePerR * rr,
      gainPerTradeLoss: coveragePerR,
    };
  }, [p2Capital, riskPercent, rr, p2MaxLoss, p2Target, challengeCost, phase1.lossIfPass, pair, slPips]);

  const totalCostIfFunded = challengeCost + phase1.lossIfPass + phase2.lossIfPass;

  const styles = {
    input: {
      width: "100%", padding: "10px 14px", boxSizing: "border-box",
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px", color: "#e8e6e1", fontSize: "15px", outline: "none",
      fontFamily: "'DM Mono', monospace",
    },
    label: {
      fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.5px",
      color: "#8a8579", marginBottom: "6px", display: "block",
      fontFamily: "'DM Sans', sans-serif",
    },
    card: {
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px", padding: "20px",
    },
  };

  const ResultBox = ({ label, value, sublabel, color }) => (
    <div style={{
      background: `${color}10`, border: `1px solid ${color}30`,
      borderRadius: "12px", padding: "18px", textAlign: "center",
    }}>
      <div style={{ fontSize: "10px", color, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>
        {label}
      </div>
      <div style={{ fontSize: "28px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#e8e6e1" }}>
        {value}
      </div>
      {sublabel && <div style={{ fontSize: "11px", color: "#6b6560", marginTop: "4px" }}>{sublabel}</div>}
    </div>
  );

  const DetailRow = ({ label, value, color = "#e8e6e1", bold }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: bold ? "12px" : "4px 0",
      background: bold ? "rgba(245,158,11,0.08)" : "none",
      borderRadius: bold ? "8px" : 0,
      borderTop: bold ? "1px solid rgba(245,158,11,0.2)" : "none",
    }}>
      <span style={{ fontSize: "13px", color: bold ? "#e8e6e1" : "#8a8579", fontWeight: bold ? 700 : 400 }}>{label}</span>
      <span style={{ fontSize: bold ? "17px" : "14px", fontWeight: 600, color, fontFamily: "'DM Mono', monospace" }}>{value}</span>
    </div>
  );

  const PhaseToggle = () => (
    <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "10px", padding: "4px" }}>
      {[{ id: "f1", label: "Fase 1" }, { id: "f2", label: "Fase 2" }, { id: "total", label: "Resumen" }].map(p => (
        <button key={p.id} onClick={() => setActivePhase(p.id)} style={{
          flex: 1, padding: "10px 16px", borderRadius: "8px", border: "none", cursor: "pointer",
          background: activePhase === p.id ? (p.id === "f1" ? "#3b82f6" : p.id === "f2" ? "#8b5cf6" : "#22c55e") : "transparent",
          color: activePhase === p.id ? "#fff" : "#6b6560",
          fontSize: "13px", fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.2s",
        }}>{p.label}</button>
      ))}
    </div>
  );

  const currentPhase = activePhase === "f1" ? phase1 : phase2;
  const phaseColor = activePhase === "f1" ? "#3b82f6" : "#8b5cf6";

  return (
    <div style={{ minHeight: "100vh", background: "#0f0e0c", color: "#e8e6e1", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        padding: "28px 24px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "linear-gradient(180deg, rgba(34,197,94,0.04) 0%, transparent 100%)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "10px",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
          }}>⚖</div>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, letterSpacing: "-0.5px" }}>Hedge Calc</h1>
            <p style={{ fontSize: "12px", color: "#6b6560", margin: 0 }}>Cobertura Fase 1 + Fase 2</p>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {[{ id: "calc", label: "Calcular Lote" }, { id: "scenario", label: "Escenarios" }].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: "14px", background: "none", border: "none", cursor: "pointer",
            color: activeTab === tab.id ? "#22c55e" : "#6b6560",
            fontSize: "13px", fontWeight: 600,
            borderBottom: activeTab === tab.id ? "2px solid #22c55e" : "2px solid transparent",
            fontFamily: "'DM Sans', sans-serif",
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ padding: "20px" }}>

        {activeTab === "calc" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            {/* Challenge Config */}
            <div style={styles.card}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 14px", color: "#c4bfb6" }}>⚙ Tu Challenge Actual</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Costo Challenge ($)</label>
                  <input type="number" value={challengeCost} onChange={e => setChallengeCost(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Equity Actual ($)</label>
                  <input type="number" value={currentEquity} onChange={e => setCurrentEquity(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Max Loss Restante ($)</label>
                  <input type="number" step="0.01" value={maxLossRemaining} onChange={e => setMaxLossRemaining(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Profit Target ($)</label>
                  <input type="number" value={profitTarget} onChange={e => setProfitTarget(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Riesgo por trade (%)</label>
                  <input type="number" step="0.1" value={riskPercent} onChange={e => setRiskPercent(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>R:R Ratio</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {[1, 2, 3].map(v => (
                      <button key={v} onClick={() => setRr(v)} style={{
                        flex: 1, padding: "10px", borderRadius: "8px", border: "none",
                        background: rr === v ? "#22c55e" : "rgba(255,255,255,0.06)",
                        color: rr === v ? "#0f0e0c" : "#8a8579",
                        fontWeight: 600, cursor: "pointer", fontSize: "14px",
                        fontFamily: "'DM Mono', monospace",
                      }}>1:{v}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Phase 2 Config */}
            <div style={{ ...styles.card, borderColor: "rgba(139,92,246,0.15)" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 14px", color: "#8b5cf6" }}>📋 Config Fase 2</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Capital F2 ($)</label>
                  <input type="number" value={p2Capital} onChange={e => setP2Capital(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Max Loss (%)</label>
                  <input type="number" step="0.5" value={p2MaxLoss} onChange={e => setP2MaxLoss(+e.target.value)} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Target (%)</label>
                  <input type="number" step="0.5" value={p2Target} onChange={e => setP2Target(+e.target.value)} style={styles.input} />
                </div>
              </div>
            </div>

            {/* Trade Setup */}
            <div style={styles.card}>
              <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 14px", color: "#c4bfb6" }}>📊 Setup del Trade</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={styles.label}>Par / Instrumento</label>
                  <select value={pair} onChange={e => setPair(e.target.value)} style={{ ...styles.input, cursor: "pointer" }}>
                    {Object.entries(PAIRS).map(([k, v]) => (
                      <option key={k} value={k} style={{ background: "#1a1918", color: "#e8e6e1" }}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Stop Loss (pips)</label>
                  <input type="number" value={slPips} onChange={e => setSlPips(+e.target.value)} style={styles.input} />
                </div>
              </div>
            </div>

            {/* Phase Toggle */}
            <PhaseToggle />

            {/* Results per phase */}
            {activePhase !== "total" && (
              <div style={{
                background: `linear-gradient(135deg, ${phaseColor}08, ${phaseColor}03)`,
                border: `1px solid ${phaseColor}25`,
                borderRadius: "16px", padding: "22px",
              }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 18px", color: phaseColor, textAlign: "center", letterSpacing: "1px", textTransform: "uppercase" }}>
                  {activePhase === "f1" ? "Fase 1 — Lotes" : "Fase 2 — Lotes"}
                </h3>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "18px" }}>
                  <ResultBox label="Lote Funding (F)" value={currentPhase.lotF} sublabel={`Riesgo: ${fmt(currentPhase.risk)}`} color={phaseColor} />
                  <ResultBox label="Lote Exness (E)" value={currentPhase.lotE} sublabel={`${fmt(currentPhase.coveragePerR)}/R`} color="#f59e0b" />
                </div>

                <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "14px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <DetailRow label="Riesgo (1R) en F" value={fmt(currentPhase.risk)} />
                  <DetailRow label={`TP (1:${rr}) en F`} value={`+${fmt(currentPhase.tp)}`} color="#22c55e" />
                  <DetailRow label="Cobertura por R en E" value={fmt(currentPhase.coveragePerR)} color="#f59e0b" />
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  <DetailRow label="Si TP en F → pierdes en E" value={`-${fmt(currentPhase.lossPerTradeWin)}`} color="#ef4444" />
                  <DetailRow label="Si SL en F → ganas en E" value={`+${fmt(currentPhase.gainPerTradeLoss)}`} color="#22c55e" />
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} />
                  <DetailRow label="R para quemar" value={`${currentPhase.rToDrawdown.toFixed(1)}R`} color="#ef4444" />
                  <DetailRow label="R para pasar fase" value={`${currentPhase.rToTarget.toFixed(1)}R`} color="#22c55e" />
                  {activePhase === "f2" && (
                    <DetailRow label="Inversión acumulada a cubrir" value={fmt(phase2.investedTotal)} color="#8b5cf6" />
                  )}
                  <DetailRow label="Pérdida en E si pasas" value={`-${fmt(currentPhase.lossIfPass)}`} color="#ef4444" />
                </div>
              </div>
            )}

            {/* Total Summary */}
            {activePhase === "total" && (
              <div style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "16px", padding: "22px",
              }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 20px", color: "#22c55e", textAlign: "center", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Resumen Completo
                </h3>

                {/* Scenario cards */}
                {[
                  { title: "💀 Quemas en Fase 1", color: "#ef4444", items: [
                    { l: "Challenge perdido", v: `-${fmt(challengeCost)}`, c: "#ef4444" },
                    { l: `Ganancia E (${phase1.rToDrawdown.toFixed(1)}R × ${fmt(phase1.coveragePerR)})`, v: `+${fmt(challengeCost)}`, c: "#22c55e" },
                    { l: "NETO", v: "$0.00", c: "#f59e0b", bold: true },
                  ]},
                  { title: "⚠️ Pasas F1, quemas F2", color: "#f59e0b", items: [
                    { l: "Challenge", v: `-${fmt(challengeCost)}`, c: "#ef4444" },
                    { l: "Pérdida E en Fase 1", v: `-${fmt(phase1.lossIfPass)}`, c: "#ef4444" },
                    { l: `Ganancia E en Fase 2 (${phase2.rToDrawdown.toFixed(1)}R × ${fmt(phase2.coveragePerR)})`, v: `+${fmt(phase2.investedTotal)}`, c: "#22c55e" },
                    { l: "NETO", v: "$0.00", c: "#f59e0b", bold: true },
                  ]},
                  { title: "🏆 FONDEADO — Pasas ambas", color: "#22c55e", items: [
                    { l: "Costo challenge", v: `-${fmt(challengeCost)}`, c: "#ef4444" },
                    { l: "Pérdida E Fase 1", v: `-${fmt(phase1.lossIfPass)}`, c: "#ef4444" },
                    { l: "Pérdida E Fase 2", v: `-${fmt(phase2.lossIfPass)}`, c: "#ef4444" },
                    { l: "COSTO TOTAL", v: `-${fmt(totalCostIfFunded)}`, c: "#f59e0b", bold: true },
                  ]},
                ].map((scenario, si) => (
                  <div key={si} style={{
                    background: `${scenario.color}06`, border: `1px solid ${scenario.color}20`,
                    borderRadius: "12px", padding: "16px", marginBottom: si < 2 ? "14px" : 0,
                  }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, color: scenario.color, margin: "0 0 12px" }}>{scenario.title}</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {scenario.items.map((item, i) => (
                        <DetailRow key={i} label={item.l} value={item.v} color={item.c} bold={item.bold} />
                      ))}
                    </div>
                  </div>
                ))}

                {/* Capital Exness */}
                <div style={{
                  marginTop: "18px", textAlign: "center", padding: "18px",
                  background: "rgba(245,158,11,0.06)", borderRadius: "12px",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}>
                  <div style={{ fontSize: "10px", color: "#f59e0b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "8px", fontWeight: 600 }}>
                    Capital Recomendado en Exness
                  </div>
                  <div style={{ fontSize: "36px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#f59e0b" }}>
                    {fmt(Math.ceil(totalCostIfFunded * 1.3))}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6b6560", marginTop: "6px" }}>
                    Incluye margen operativo del 30%
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "scenario" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <PhaseToggle />

            {activePhase !== "total" && (
              <>
                {/* Per trade result */}
                <div style={styles.card}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 16px", color: phaseColor }}>
                    {activePhase === "f1" ? "Fase 1" : "Fase 2"} — Resultado por Trade
                  </h3>
                  {[
                    {
                      title: `✅ TP en F (ganas 1:${rr})`,
                      items: [
                        { l: "Funding Pips", v: `+${fmt(currentPhase.tp)}`, c: "#22c55e" },
                        { l: "Exness", v: `-${fmt(currentPhase.lossPerTradeWin)}`, c: "#ef4444" },
                      ]
                    },
                    {
                      title: "❌ SL en F (pierdes)",
                      items: [
                        { l: "Funding Pips", v: `-${fmt(currentPhase.risk)}`, c: "#ef4444" },
                        { l: "Exness", v: `+${fmt(currentPhase.gainPerTradeLoss)}`, c: "#22c55e" },
                      ]
                    },
                  ].map((block, bi) => (
                    <div key={bi} style={{
                      background: "rgba(0,0,0,0.25)", borderRadius: "10px",
                      padding: "14px", marginBottom: bi === 0 ? "10px" : 0,
                    }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#c4bfb6", marginBottom: "10px" }}>{block.title}</div>
                      {block.items.map((item, i) => (
                        <DetailRow key={i} label={item.l} value={item.v} color={item.c} />
                      ))}
                    </div>
                  ))}
                </div>

                {/* End scenarios */}
                <div style={{
                  ...styles.card,
                  borderColor: "rgba(239,68,68,0.2)", background: "rgba(239,68,68,0.03)",
                }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px", color: "#ef4444" }}>
                    💀 Si quemas {activePhase === "f1" ? "Fase 1" : "Fase 2"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#6b6560", margin: "0 0 14px" }}>
                    Pierdes {currentPhase.rToDrawdown.toFixed(1)}R netos → ganas en E
                  </p>
                  <DetailRow label="Pérdida (challenge)" value={`-${fmt(activePhase === "f1" ? challengeCost : phase2.investedTotal)}`} color="#ef4444" />
                  <DetailRow label="Ganancia en E" value={`+${fmt(activePhase === "f1" ? challengeCost : phase2.investedTotal)}`} color="#22c55e" />
                  <div style={{ marginTop: "8px" }}>
                    <DetailRow label="RESULTADO NETO" value="$0.00" color="#22c55e" bold />
                  </div>
                </div>

                <div style={{
                  ...styles.card,
                  borderColor: "rgba(34,197,94,0.2)", background: "rgba(34,197,94,0.03)",
                }}>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "0 0 4px", color: "#22c55e" }}>
                    🏆 Si pasas {activePhase === "f1" ? "Fase 1" : "Fase 2"}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#6b6560", margin: "0 0 14px" }}>
                    Ganas {currentPhase.rToTarget.toFixed(1)}R netos → pierdes en E
                  </p>
                  <DetailRow label={activePhase === "f1" ? "Avanzas a Fase 2" : "FONDEADO 🏆"} value="✓" color="#22c55e" />
                  <DetailRow label="Pérdida en E" value={`-${fmt(currentPhase.lossIfPass)}`} color="#ef4444" />
                  <div style={{ marginTop: "8px" }}>
                    <DetailRow
                      label={activePhase === "f1" ? "Inversión acumulada para F2" : "COSTO TOTAL FONDEADO"}
                      value={`-${fmt(activePhase === "f1" ? challengeCost + phase1.lossIfPass : totalCostIfFunded)}`}
                      color="#f59e0b" bold
                    />
                  </div>
                </div>
              </>
            )}

            {activePhase === "total" && (
              <div style={{
                background: "linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))",
                border: "1px solid rgba(34,197,94,0.2)",
                borderRadius: "16px", padding: "22px",
              }}>
                <h3 style={{ fontSize: "13px", fontWeight: 600, margin: "0 0 18px", color: "#22c55e", textAlign: "center", letterSpacing: "1px", textTransform: "uppercase" }}>
                  Mapa Completo de Cobertura
                </h3>

                {/* Visual flow */}
                {[
                  { emoji: "🎯", phase: "FASE 1", risk: fmt(phase1.risk), tp: fmt(phase1.tp), lotF: phase1.lotF, lotE: phase1.lotE, coverR: fmt(phase1.coveragePerR), color: "#3b82f6" },
                  { emoji: "🎯", phase: "FASE 2", risk: fmt(phase2.risk), tp: fmt(phase2.tp), lotF: phase2.lotF, lotE: phase2.lotE, coverR: fmt(phase2.coveragePerR), color: "#8b5cf6" },
                ].map((p, i) => (
                  <div key={i} style={{
                    background: `${p.color}08`, border: `1px solid ${p.color}20`,
                    borderRadius: "12px", padding: "16px", marginBottom: "14px",
                  }}>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: p.color, marginBottom: "12px" }}>
                      {p.emoji} {p.phase}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#6b6560", letterSpacing: "1px", textTransform: "uppercase" }}>Lote F</div>
                        <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: p.color }}>{p.lotF}</div>
                      </div>
                      <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: "8px", padding: "12px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", color: "#6b6560", letterSpacing: "1px", textTransform: "uppercase" }}>Lote E</div>
                        <div style={{ fontSize: "22px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#f59e0b" }}>{p.lotE}</div>
                      </div>
                    </div>
                    <div style={{ marginTop: "10px", fontSize: "12px", color: "#8a8579", textAlign: "center" }}>
                      Riesgo: {p.risk} | TP: {p.tp} | Cobertura: {p.coverR}/R
                    </div>
                  </div>
                ))}

                {/* Final costs */}
                <div style={{
                  background: "rgba(0,0,0,0.3)", borderRadius: "12px", padding: "18px",
                }}>
                  <div style={{ fontSize: "11px", color: "#22c55e", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "14px", fontWeight: 600, textAlign: "center" }}>
                    Costos Posibles
                  </div>
                  <DetailRow label="Si quemas F1" value="$0.00" color="#22c55e" />
                  <DetailRow label="Si pasas F1, quemas F2" value="$0.00" color="#22c55e" />
                  <div style={{ marginTop: "8px" }}>
                    <DetailRow label="Si quedas FONDEADO" value={`-${fmt(totalCostIfFunded)}`} color="#f59e0b" bold />
                  </div>
                </div>

                <div style={{
                  marginTop: "16px", textAlign: "center", padding: "16px",
                  background: "rgba(245,158,11,0.06)", borderRadius: "12px",
                  border: "1px solid rgba(245,158,11,0.15)",
                }}>
                  <div style={{ fontSize: "10px", color: "#f59e0b", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px", fontWeight: 600 }}>
                    Depositar en Exness
                  </div>
                  <div style={{ fontSize: "34px", fontWeight: 700, fontFamily: "'DM Mono', monospace", color: "#f59e0b" }}>
                    {fmt(Math.ceil(totalCostIfFunded * 1.3))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
