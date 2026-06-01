import { useEffect, useState } from 'react';

const SYMBOLS = ['JPM','GS','MS','BAC','C','WFC'];

interface Tx {
  name: string; change: number; transactionDate: string;
  transactionCode: string; transactionPrice: number; share: number;
}

export function InsiderView() {
  const [sym, setSym] = useState('JPM');
  const [data, setData] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true); setData([]);
    fetch(`/api/insider/${sym}`).then(r=>r.json()).then(d=>setData(Array.isArray(d)?d:(d.data??[]))).catch(()=>{}).finally(()=>setLoading(false));
  }, [sym]);

  const buys = data.filter(t=>t.transactionCode==='P').length;
  const sells = data.filter(t=>t.transactionCode==='S').length;
  const sentColor = buys+sells===0 ? '#4a5568' : buys>sells ? '#00e676' : buys<sells ? '#ff3b3b' : '#ffc107';

  return (
    <div className="dc-scroll-area">
      <div className="dc-sym-bar">
        {SYMBOLS.map(s => (
          <button key={s} className={`dc-sym-chip${sym===s?' active':''}`} onClick={()=>setSym(s)}>{s}</button>
        ))}
      </div>
      <div className="dc-insider-sentiment">
        <div className="dc-sent-box"><div className="dc-sent-label">PURCHASES</div><div className="dc-sent-val" style={{color:'#00e676'}}>{buys}</div></div>
        <div className="dc-sent-divider"/>
        <div className="dc-sent-box"><div className="dc-sent-label">SENTIMENT</div><div className="dc-sent-val" style={{color:sentColor}}>{buys+sells===0?'—':buys>sells?'▲ BULLISH':buys<sells?'▼ BEARISH':'◆ NEUTRAL'}</div></div>
        <div className="dc-sent-divider"/>
        <div className="dc-sent-box"><div className="dc-sent-label">SALES</div><div className="dc-sent-val" style={{color:'#ff3b3b'}}>{sells}</div></div>
      </div>
      {loading && <div className="dc-loading">Loading insider data…</div>}
      {!loading && data.length===0 && <div className="dc-empty">No insider transactions found for {sym}.</div>}
      <div className="dc-insider-list">
        {data.slice(0,30).map((t,i) => {
          const isBuy = t.transactionCode==='P';
          const isSell = t.transactionCode==='S';
          const color = isBuy?'#00e676':isSell?'#ff3b3b':'#4a5568';
          const label = isBuy?'BUY':isSell?'SELL':t.transactionCode;
          const value = t.transactionPrice && t.change ? Math.abs(t.change*t.transactionPrice) : 0;
          return (
            <div key={i} className="dc-insider-row" style={{borderLeftColor:color}}>
              <div className="dc-ir-name">{t.name}</div>
              <div className="dc-ir-badge" style={{color,borderColor:color+'55',background:color+'11'}}>{label}</div>
              <div className="dc-ir-stats">
                <div><span className="dc-stat-lbl">SHARES</span><span className="dc-stat-val">{Math.abs(t.change).toLocaleString()}</span></div>
                <div><span className="dc-stat-lbl">PRICE</span><span className="dc-stat-val">{t.transactionPrice?`$${t.transactionPrice.toFixed(2)}`:'—'}</span></div>
                <div><span className="dc-stat-lbl">VALUE</span><span className="dc-stat-val">{value?`$${(value/1000).toFixed(0)}K`:'—'}</span></div>
                <div><span className="dc-stat-lbl">DATE</span><span className="dc-stat-val">{t.transactionDate}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
