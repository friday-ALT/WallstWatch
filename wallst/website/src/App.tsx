import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { TickerBar } from './components/TickerBar';
import { ProUpgradeBanner } from './components/ProUpgradeBanner';
import { Landing } from './pages/Landing';
import { Features } from './pages/Features';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { AuthPage } from './pages/AuthPage';
import { Pricing } from './pages/Pricing';
import { MarketMap } from './pages/MarketMap';
import { DailyReport } from './pages/DailyReport';
import { EquityPage } from './pages/EquityPage';

import { MobileAppBanner } from './components/MobileAppBanner';

function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app">
      <TickerBar />
      <Navbar />
      <main>{children}</main>
      <Footer />
      <MobileAppBanner />
    </div>
  );
}

export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <ProUpgradeBanner />
      {renderRoutes(pathname)}
    </>
  );
}

function renderRoutes(pathname: string) {
  if (pathname === '/dashboard') return <Dashboard />;
  if (pathname.startsWith('/equity/')) return <EquityPage />;
  if (pathname === '/map')       return <MarketMap />;
  if (pathname === '/report')    return <DailyReport />;
  if (pathname === '/login')     return <AuthPage mode="login" />;
  if (pathname === '/signup')    return <AuthPage mode="signup" />;

  return (
    <MarketingLayout>
      <Routes>
        <Route path="/"        element={<Landing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/about"   element={<About />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/map"      element={<MarketMap />} />
        <Route path="/report"   element={<DailyReport />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login"   element={<AuthPage mode="login" />} />
        <Route path="/signup"  element={<AuthPage mode="signup" />} />
      </Routes>
    </MarketingLayout>
  );
}
