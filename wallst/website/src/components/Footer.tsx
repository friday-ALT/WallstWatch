import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <div className="footer-brand-logo">◆ WALLST WATCH</div>
          <p className="footer-brand-desc">
            Real-time banking intelligence for serious investors. Track the Big 6 and beyond with institutional-grade data.
          </p>
        </div>
        <div>
          <div className="footer-col-title">Product</div>
          <ul className="footer-links">
            <li><Link to="/">Overview</Link></li>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Data Sources</div>
          <ul className="footer-links">
            <li><a href="https://finnhub.io" target="_blank" rel="noreferrer">Finnhub API</a></li>
            <li><a href="#">SEC EDGAR</a></li>
            <li><a href="#">FDIC Data</a></li>
            <li><a href="#">Fed Reserve</a></li>
          </ul>
        </div>
        <div>
          <div className="footer-col-title">Platform</div>
          <ul className="footer-links">
            <li><a href="#">Expo Go (iOS)</a></li>
            <li><a href="#">Expo Go (Android)</a></li>
            <li><a href="#">Web App</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">© {new Date().getFullYear()} WALLST WATCH. For informational purposes only. Not financial advice.</span>
        <span className="footer-clock">NEW YORK · {clock} EST</span>
        <div className="footer-status">
          <div className="footer-status-dot" />
          <span className="footer-status-text">ALL SYSTEMS OPERATIONAL</span>
        </div>
      </div>
    </footer>
  );
}
