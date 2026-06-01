import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTerminal } from '../terminal/TerminalProvider';
import { CommandBarV2 } from '../terminal/CommandBarV2';
import { KeyboardShortcuts } from '../terminal/KeyboardShortcuts';
import { useLiveQuotes } from '../dashboard/hooks/useLiveQuotes';
import { BANKS, Bank, riskColor } from '../dashboard/data/banks';
import { BankMapView } from '../dashboard/views/BankMapView';
import { CreditView } from '../dashboard/views/CreditView';
import { MacroView } from '../dashboard/views/MacroView';
import { EarningsView } from '../dashboard/views/EarningsView';
import { InsiderView } from '../dashboard/views/InsiderView';
import { FedWatchView } from '../dashboard/views/FedWatchView';
import { ChartsView } from '../dashboard/views/ChartsView';
import { FXView } from '../dashboard/views/FXView';
import { CompareView } from '../dashboard/views/CompareView';
import { DailyBriefView } from '../dashboard/views/DailyBriefView';
import { PortfolioView } from '../dashboard/views/PortfolioView';
import { ScreenerView } from '../dashboard/views/ScreenerView';
import { OptionsFlowView } from '../dashboard/views/OptionsFlowView';
import { ResearchView } from '../dashboard/views/ResearchView';
import { BreadthView } from '../dashboard/views/BreadthView';
import { WatchlistView } from '../dashboard/views/WatchlistView';
import { AlertsView } from '../dashboard/views/AlertsView';
import { DarkPoolView } from '../dashboard/views/DarkPoolView';
import { CalendarHubView } from '../dashboard/views/CalendarHubView';
import { NewsIntelView } from '../dashboard/views/NewsIntelView';
import { DealsIntelView } from '../dashboard/views/DealsIntelView';
import { BankingRegView } from '../dashboard/views/BankingRegView';
import { TeamsView } from '../dashboard/views/TeamsView';
import { WorkspaceView } from '../dashboard/views/WorkspaceView';
import { FixedIncomeView } from '../dashboard/views/FixedIncomeView';
import { ProGate } from '../dashboard/components/ProGate';
import { TabNav, Tab } from '../dashboard/components/TabNav';
import { useAuth } from '../auth/AuthContext';
import { effectivePlanLabel } from '../config/features';
import '../styles/dashboard.css';

const TICKER_SYMS = ['JPM','GS','MS','BAC','C','WFC','SPY','QQQ','VIX'];

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { goEquity, goMap, symbol } = useTerminal();
  const { user, token } = useAuth();
  const planLabel = effectivePlanLabel(user?.plan, (user as { trialActive?: boolean } | null)?.trialActive);
  const [tab, setTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'brief');

  useEffect(() => {
    const t = searchParams.get('tab') as Tab | null;
    if (t) setTab(t);
  }, [searchParams]);
  const [selected, setSelected] = useState<Bank | null>(null);
  const [time, setTime] = useState('');
  const [news, setNews] = useState<any[]>([]);
  const [bankNews, setBankNews] = useState<any[]>([]);
  const quotes = useLiveQuotes(TICKER_SYMS);

  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}));
    tick(); const id = setInterval(tick,1000); return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch('/api/news').then(r=>r.json()).then(d=>setNews(d.slice(0,8))).catch(()=>{});
  }, []);

  useEffect(() => {
    if (!selected) return;
    setBankNews([]);
    fetch(`/api/news/${selected.sym}`).then(r=>r.json()).then(d=>setBankNews(d.slice(0,6))).catch(()=>{});
  }, [selected]);

  const setTabRoute = (t: Tab) => {
    setTab(t);
    navigate(`/dashboard?tab=${t}`, { replace: true });
  };

  const handleCommand = (action: string) => {
    if (action.startsWith('tab:')) setTabRoute(action.replace('tab:', '') as Tab);
    else if (action.startsWith('bank:')) {
      const sym = action.replace('bank:', '');
      const bank = BANKS.find(b => b.sym === sym);
      if (bank) { setSelected(bank); setTabRoute('banks'); }
    }
  };

  return (
    <div className="dc-root">
      {/* ── Header ── */}
      <header className="dc-header">
        <div className="dc-header-left">
          <button type="button" className="dc-back-btn" onClick={() => goMap()}>◆ MAP</button>
          <button type="button" className="dc-back-btn" onClick={() => goEquity(symbol)}>◎ {symbol}</button>
          <button type="button" className="dc-back-btn" onClick={() => navigate('/')}>← HOME</button>
          <span className="dc-logo">◆ WALLST WATCH</span>
          <span className="dc-header-badge">COMMAND CENTER</span>
        </div>
        <div className="dc-ticker-inline">
          {TICKER_SYMS.map(sym => {
            const q = quotes[sym]; const up = q ? q.dp >= 0 : true;
            return (
              <div key={sym} className="dc-tick-item">
                <span className="dc-tick-sym">{sym}</span>
                <span className={`dc-tick-price ${up?'up':'down'}`}>{q?`$${q.c.toFixed(2)}`:'—'}</span>
                <span className={`dc-tick-chg ${up?'up':'down'}`}>{q?`${up?'+':''}${q.dp.toFixed(2)}%`:''}</span>
              </div>
            );
          })}
        </div>
        <div className="dc-header-right">
          <CommandBarV2 onTab={t => setTabRoute(t as Tab)} onMap={goMap} />
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 8, borderLeft: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-sec)' }}>{user.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 7, color: 'var(--red)', border: '1px solid var(--red)', padding: '1px 5px', borderRadius: 2 }}>{planLabel}</span>
            </div>
          ) : (
            <button onClick={() => navigate('/login')} style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--text-sec)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, padding: '4px 10px', borderRadius: 2, cursor: 'pointer' }}>SIGN IN</button>
          )}
          <div className="dc-live-dot"/><span className="dc-live-text">LIVE</span>
          <span className="dc-clock">{time}</span>
        </div>
      </header>

      {/* ── Grouped Tab Nav ── */}
      <TabNav active={tab} onChange={setTabRoute} />
      <KeyboardShortcuts onTab={t => setTabRoute(t as Tab)} onMap={goMap} onEquity={() => goEquity(symbol)} />

      {/* ── Body ── */}
      <div className="dc-body">
        {/* LEFT panel */}
        <aside className="dc-left">
          <div className="dc-panel-title">LATEST INTEL</div>
          {news.map((item,i) => (
            <a key={i} href={item.url||'#'} target="_blank" rel="noreferrer" className="dc-news-item">
              <span className="dc-news-headline">{item.headline}</span>
              <span className="dc-news-meta">{item.source}</span>
            </a>
          ))}
          <div className="dc-panel-title" style={{marginTop:20}}>KEY RATES</div>
          {[
            ['FED FUNDS','4.50%','#ffc107'],
            ['10Y YIELD','4.38%','#ffc107'],
            ['2Y YIELD','4.72%','#ff3b3b'],
            ['VIX', quotes.VIX ? quotes.VIX.c.toFixed(2) : '18.4','#ffc107'],
            ['DXY','104.2','#2196f3'],
            ['WTI CRUDE','$79.24','#ff6d00'],
          ].map(([l,v,c])=>(
            <div key={l} className="dc-rate-row">
              <span className="dc-rate-label">{l}</span>
              <span className="dc-rate-val" style={{color:c as string}}>{v as string}</span>
            </div>
          ))}
          <div className="dc-panel-title" style={{marginTop:20}}>QUICK ACCESS</div>
          {[
            ['◆ Daily Brief','brief'],
            ['📈 Charts','charts'],
            ['◎ FX & Bonds','fx'],
            ['◫ Breadth','breadth'],
            ['★ Watchlist','watchlist'],
            ['◉ Alerts','alerts'],
          ].map(([label,t])=>(
            <button key={t} onClick={()=>setTab(t as Tab)}
              style={{display:'block',width:'100%',background:'none',border:'1px solid var(--border)',borderRadius:2,padding:'6px 8px',marginBottom:4,cursor:'pointer',fontFamily:'var(--font-mono)',fontSize:9,fontWeight:700,color:tab===t?'var(--red)':'var(--text-sec)',textAlign:'left',letterSpacing:1,transition:'all .2s',borderColor:tab===t?'var(--red)':'var(--border)'}}
              onMouseOver={e=>(e.currentTarget.style.borderColor='var(--red)')}
              onMouseOut={e=>(e.currentTarget.style.borderColor=tab===t?'var(--red)':'var(--border)')}>
              {label as string}
            </button>
          ))}
        </aside>

        {/* CENTER */}
        <section className="dc-center">
          {tab==='brief'     && <DailyBriefView token={token} />}
          {tab==='banks'     && <BankMapView quotes={quotes} onSelect={setSelected} selected={selected} />}
          {tab==='charts'    && <ChartsView />}
          {tab==='screener'  && <ScreenerView token={token} />}
          {tab==='credit'    && <CreditView />}
          {tab==='macro'     && <MacroView quotes={quotes} />}
          {tab==='fx'        && <FXView />}
          {tab==='fixedincome' && <FixedIncomeView />}
          {tab==='options'   && <ProGate feature="Options flow" requiredPlan="professional"><OptionsFlowView /></ProGate>}
          {tab==='earnings'  && <ProGate feature="Earnings calendar" requiredPlan="pro"><EarningsView /></ProGate>}
          {tab==='insider'   && <ProGate feature="Insider transactions" requiredPlan="pro"><InsiderView /></ProGate>}
          {tab==='fed'       && <ProGate feature="Fed Watch" requiredPlan="pro"><FedWatchView /></ProGate>}
          {tab==='compare'   && <CompareView quotes={quotes} />}
          {tab==='portfolio' && <PortfolioView quotes={quotes} token={token} />}
          {tab==='research'  && <ProGate feature="AI research" requiredPlan="professional"><ResearchView token={token} /></ProGate>}
          {tab==='breadth'   && <BreadthView />}
          {tab==='watchlist' && <WatchlistView quotes={quotes} token={token} />}
          {tab==='alerts'    && <AlertsView quotes={quotes} token={token} />}
          {tab==='darkpool'  && <ProGate feature="Dark pool" requiredPlan="professional"><DarkPoolView /></ProGate>}
          {tab==='calendar'  && <CalendarHubView />}
          {tab==='news'      && <NewsIntelView />}
          {tab==='deals'     && <DealsIntelView />}
          {tab==='regulatory' && <BankingRegView />}
          {tab==='teams'     && <TeamsView />}
          {tab==='workspace' && <WorkspaceView />}
        </section>

        {/* RIGHT panel */}
        <aside className="dc-right">
          {!selected ? (
            <div className="dc-right-empty">
              <div className="dc-right-empty-icon">◆</div>
              <div className="dc-right-empty-text">Select a bank from the grid to view detailed intelligence</div>
              <div style={{marginTop:16,width:'100%'}}>
                <div className="dc-panel-title">SECTOR OVERVIEW</div>
                {BANKS.map(b=>{
                  const q=quotes[b.sym]; const up=q?q.dp>=0:true; const rc=riskColor(b.rl);
                  return (
                    <div key={b.sym} onClick={()=>{setSelected(b);setTab('banks');}} className="dc-rate-row" style={{cursor:'pointer',borderLeft:`2px solid ${rc}`,paddingLeft:8,marginBottom:4}}>
                      <span style={{fontWeight:700,color:'var(--text)',width:40,fontSize:10}}>{b.sym}</span>
                      <span style={{fontSize:10,fontWeight:700,color:up?'#00e676':'#ff3b3b',flex:1}}>{q?`$${q.c.toFixed(2)}`:b.pr}</span>
                      <span style={{fontSize:8,color:rc}}>{b.rk}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="dc-right-selected">
              <div className="dc-detail-header">
                <div><div className="dc-detail-sym">{selected.sym}</div><div className="dc-detail-name">{selected.nm}</div></div>
                <button className="dc-detail-close" onClick={()=>setSelected(null)}>✕</button>
              </div>
              {(()=>{
                const q=quotes[selected.sym];
                const price=q?q.c:parseFloat(selected.pr);
                const dp=q?q.dp:parseFloat(selected.ch);
                const up=dp>=0; const rc=riskColor(selected.rl);
                return (<>
                  <div className="dc-detail-price" style={{color:up?'#00e676':'#ff3b3b'}}>
                    ${price.toFixed(2)} <span style={{fontSize:13}}>{up?'▲':'▼'} {Math.abs(dp).toFixed(2)}%</span>
                  </div>
                  <div className="dc-detail-badge" style={{color:rc,borderColor:rc+'55',background:rc+'11'}}>{selected.rk}</div>
                  <div className="dc-detail-stats">
                    {[['MKT CAP',selected.mc],['CET1',selected.c1],['NET INC',selected.ni]].map(([l,v])=>(
                      <div key={l} className="dc-detail-stat"><span className="dc-stat-lbl">{l}</span><span className="dc-stat-val">{v}</span></div>
                    ))}
                  </div>
                  <button onClick={()=>setTab('charts')} style={{width:'100%',background:'var(--red)',border:'none',color:'#fff',fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,letterSpacing:1,padding:'8px',borderRadius:2,cursor:'pointer',marginBottom:8}}>
                    📈 VIEW CHART →
                  </button>
                  <button onClick={()=>setTab('compare')} style={{width:'100%',background:'none',border:'1px solid var(--border)',color:'var(--text-sec)',fontFamily:'var(--font-mono)',fontSize:10,fontWeight:700,letterSpacing:1,padding:'8px',borderRadius:2,cursor:'pointer',marginBottom:12}}>
                    ⇄ COMPARE WITH PEER →
                  </button>
                  <div className="dc-panel-title">INTELLIGENCE SIGNALS</div>
                  {selected.sg.map((sg,i)=>(
                    <div key={i} className="dc-signal" style={{borderLeftColor:sg.y==='ok'?'#00e676':sg.y==='warn'?'#ff3b3b':'#ffc107'}}>{sg.t}</div>
                  ))}
                  <div className="dc-quote-box">
                    <div className="dc-quote-label">ANALYST QUOTE</div>
                    <div className="dc-quote-text">"{selected.q}"</div>
                  </div>
                  <div className="dc-panel-title">LATEST NEWS</div>
                  {bankNews.length===0 && <div className="dc-loading">Loading…</div>}
                  {bankNews.map((item,i)=>(
                    <a key={i} href={item.url||'#'} target="_blank" rel="noreferrer" className="dc-news-item">
                      <span className="dc-news-headline">{item.headline}</span>
                      <span className="dc-news-meta">{item.source}</span>
                    </a>
                  ))}
                </>);
              })()}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
