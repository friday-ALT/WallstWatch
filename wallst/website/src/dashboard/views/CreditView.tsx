const PILLARS = [
  { title:'CAPITAL ADEQUACY', color:'#00e676', metrics:[
    {l:'JPM CET1',v:'15.3%',ok:true,n:'100bps above minimum'},{l:'GS CET1',v:'14.8%',ok:true,n:'GSIB surcharge applies'},
    {l:'BAC CET1',v:'11.9%',ok:false,n:'Thinner buffer vs peers'},{l:'C CET1',v:'13.4%',ok:false,n:'Transformation headwinds'},
  ], summary:'Big-6 average CET1 at 13.8% — above 2008 levels but stress test outcomes pending.' },
  { title:'LIQUIDITY COVERAGE', color:'#2196f3', metrics:[
    {l:'Sector Avg LCR',v:'127%',ok:true,n:'Above 100% requirement'},{l:'JPM LCR',v:'112%',ok:true,n:'Fortress positioning'},
    {l:'Short-term debt',v:'$420B',ok:false,n:'Refinancing due 2026'},{l:'Fed Facility',v:'ACTIVE',ok:true,n:'BTFP legacy exposure'},
  ], summary:'Liquidity ratios healthy at aggregate; idiosyncratic risks remain at WFC/BAC.' },
  { title:'ASSET QUALITY', color:'#ffc107', metrics:[
    {l:'CRE Delinquency',v:'4.2%',ok:false,n:'Office default spike'},{l:'Consumer NPL',v:'1.8%',ok:true,n:'Normalizing post-COVID'},
    {l:'Credit Card DQ',v:'2.9%',ok:false,n:'Rising — watch BAC/C'},{l:'IG Corp Spreads',v:'+95bps',ok:true,n:'Tighter than 2023'},
  ], summary:'CRE office exposure remains the primary structural vulnerability across US banks.' },
  { title:'SYSTEMIC RISK', color:'#b388ff', metrics:[
    {l:'SRISK Aggregate',v:'$1.4T',ok:false,n:'Capital shortfall in tail'},{l:'Interconnectedness',v:'HIGH',ok:false,n:'JPM/GS network hubs'},
    {l:'DFAST 2025',v:'ALL PASS',ok:true,n:'Adverse scenario'},{l:'Basel III Endgame',v:'DELAYED',ok:true,n:'Reg relief expected'},
  ], summary:'Systemic indicators show elevated but contained risk. Fed stress tests remain the key checkpoint.' },
];

export function CreditView() {
  return (
    <div className="dc-scroll-area">
      <div className="dc-section-label">CREDIT SYSTEM HEALTH</div>
      <div className="dc-alert-box">
        <span className="dc-alert-title">◆ SYSTEM STATUS: ELEVATED VIGILANCE</span>
        <span className="dc-alert-desc">Office CRE + consumer credit normalization create dual pressure. No systemic event imminent.</span>
      </div>
      <div className="dc-pillars">
        {PILLARS.map(p => (
          <div key={p.title} className="dc-pillar" style={{ borderColor: p.color + '33' }}>
            <div className="dc-pillar-title" style={{ color: p.color }}>{p.title}</div>
            {p.metrics.map((m,i) => (
              <div key={i} className="dc-metric-row">
                <div className="dc-metric-dot" style={{ background: m.ok ? '#00e676' : '#ff3b3b' }} />
                <span className="dc-metric-label">{m.l}</span>
                <span className="dc-metric-val" style={{ color: m.ok ? '#00e676' : '#ff3b3b' }}>{m.v}</span>
                <span className="dc-metric-note">{m.n}</span>
              </div>
            ))}
            <div className="dc-pillar-summary">{p.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
