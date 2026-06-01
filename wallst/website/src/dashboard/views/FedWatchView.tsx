import { useEffect, useState } from 'react';

const FOMC = [
  {date:'Jan 28–29 2025',decision:'HOLD',prob:'97%',note:'Strong NFP data paused cuts'},
  {date:'Mar 18–19 2025',decision:'HOLD',prob:'88%',note:'Elevated inflation concerns'},
  {date:'May 6–7 2025',  decision:'HOLD',prob:'72%',note:'Tariff uncertainty'},
  {date:'Jun 17–18 2025',decision:'CUT?',prob:'55%',note:'25bps cut as base case'},
  {date:'Jul 29–30 2025',decision:'—',   prob:'—',  note:''},
  {date:'Sep 16–17 2025',decision:'—',   prob:'—',  note:''},
  {date:'Oct 28–29 2025',decision:'—',   prob:'—',  note:''},
  {date:'Dec 9–10 2025', decision:'—',   prob:'—',  note:''},
];

const RATE_HIST = [
  {date:'Mar 2022',rate:'0.25%',action:'HIKE'},{date:'Jun 2022',rate:'1.50%',action:'HIKE'},
  {date:'Sep 2022',rate:'3.00%',action:'HIKE'},{date:'Dec 2022',rate:'4.25%',action:'HIKE'},
  {date:'Jul 2023',rate:'5.25%',action:'HIKE'},{date:'Sep 2024',rate:'5.00%',action:'CUT'},
  {date:'Nov 2024',rate:'4.75%',action:'CUT'}, {date:'Dec 2024',rate:'4.50%',action:'CURRENT'},
];

interface EconEvent { event:string; date:string; country:string; impact:string; actual?:string; estimate?:string; }

export function FedWatchView() {
  const [calendar, setCalendar] = useState<EconEvent[]>([]);
  useEffect(() => {
    const from = new Date().toISOString().slice(0,10);
    const to = new Date(Date.now()+14*86400_000).toISOString().slice(0,10);
    fetch(`/api/economic-calendar?from=${from}&to=${to}`)
      .then(r=>r.json())
      .then((d:EconEvent[])=>setCalendar((d??[]).filter(e=>e.country==='US').slice(0,16)))
      .catch(()=>{});
  }, []);

  return (
    <div className="dc-scroll-area">
      <div className="dc-three-col">
        {/* Current Rate */}
        <div>
          <div className="dc-section-label">CURRENT RATE</div>
          <div className="dc-rate-display">
            <div className="dc-rate-big">4.50%</div>
            <div className="dc-rate-label">FED FUNDS TARGET</div>
            <div className="dc-rate-range">Range: 4.25% – 4.50%</div>
          </div>
          <div className="dc-table" style={{marginTop:16}}>
            {RATE_HIST.map((r,i)=>(
              <div key={i} className="dc-table-row">
                <span className="dc-table-label" style={{width:80}}>{r.date}</span>
                <span className="dc-table-val" style={{color:r.action==='HIKE'?'#ff3b3b':r.action==='CUT'?'#00e676':'#ffc107',width:60}}>{r.action}</span>
                <span className="dc-table-note">{r.rate}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FOMC Schedule */}
        <div>
          <div className="dc-section-label">2025 FOMC SCHEDULE</div>
          {FOMC.map((m,i)=>(
            <div key={i} className="dc-fomc-row">
              <div className="dc-fomc-dot" style={{background:m.decision==='HOLD'?'#ffc107':m.decision==='CUT?'?'#00e676':'#2a3040'}}/>
              <div className="dc-fomc-info">
                <div className="dc-fomc-date">{m.date}</div>
                {m.note && <div className="dc-fomc-note">{m.note}</div>}
              </div>
              {m.decision!=='—' && <span className="dc-fomc-badge" style={{color:m.decision==='HOLD'?'#ffc107':'#00e676',borderColor:(m.decision==='HOLD'?'#ffc107':'#00e676')+'55'}}>{m.decision}</span>}
              {m.prob!=='—' && <span className="dc-fomc-prob">{m.prob}</span>}
            </div>
          ))}
        </div>

        {/* Econ Calendar */}
        <div>
          <div className="dc-section-label">ECON CALENDAR (US, 14D)</div>
          {calendar.length===0 && <div className="dc-empty">No events. Check API key.</div>}
          {calendar.map((e,i)=>{
            const ic = e.impact==='high'?'#ff3b3b':e.impact==='medium'?'#ffc107':'#4a5568';
            return (
              <div key={i} className="dc-econ-row">
                <div className="dc-econ-dot" style={{background:ic}}/>
                <div className="dc-econ-info">
                  <div className="dc-econ-event">{e.event}</div>
                  <div className="dc-econ-date">{e.date}</div>
                </div>
                {e.actual && <span className="dc-econ-actual">{e.actual}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
