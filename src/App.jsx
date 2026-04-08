import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './firebase';

import SplashScreen from './components/SplashScreen';
import Navbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import QuoteSection from './components/QuoteSection';
import Countdown from './components/Countdown';
import Timeline from './components/Timeline';
import EventsGrid from './components/EventsGrid';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import AdminDashboard from './components/AdminDashboard';
import SchedulePage from './components/SchedulePage';
import FindSenior from './components/FindSenior';
import FarewellCard from './components/FarewellCard';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState('home');
  const cursorRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    try {
      const unsub = onAuthStateChanged(auth, (u) => setUser(u));
      return () => unsub();
    } catch { }
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const onMove = (e) => gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power2.out' });
    const onEnter = () => gsap.to(cursor, { opacity: 1, duration: 0.3 });
    const onLeave = () => gsap.to(cursor, { opacity: 0, duration: 0.3 });

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const handleLogout = async () => {
    try { await signOut(auth); setShowAdmin(false); } catch { }
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
    setTimeout(() => {
      if (mainRef.current) gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'power2.out' });
    }, 50);
  };

  const handleNavigate = (id) => {
    if (id === 'admin') { setShowAdmin(true); return; }
    if (id === 'schedule') { setPage('schedule'); return; }
    if (id === 'findsenior') { setPage('findsenior'); return; }
    if (id === 'card') { setPage('card'); return; }
    if (page !== 'home') setPage('home');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, page !== 'home' ? 300 : 0);
  };

  return (
    <>
      <div ref={cursorRef} className="cursor-glow" style={{ opacity: 0 }} />

      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {!showSplash && (
        <div ref={mainRef} style={{ opacity: 0 }}>
          <Navbar user={user} onLoginClick={() => setShowLogin(true)} onLogout={handleLogout} onNavigate={handleNavigate} />

          {page === 'home' && (
            <main>
              <HeroCarousel />
              <QuoteSection />
              <Countdown />
              <Timeline />
              <EventsGrid />
              <Footer />
            </main>
          )}

          {page === 'schedule' && <SchedulePage onBack={() => setPage('home')} />}
          {page === 'findsenior' && <FindSenior onBack={() => setPage('home')} />}
          {page === 'card' && <FarewellCard onBack={() => setPage('home')} />}

          <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSuccess={() => setShowLogin(false)} />
          {showAdmin && user && <AdminDashboard onClose={() => setShowAdmin(false)} />}
        </div>
      )}
    </>
  );
}
