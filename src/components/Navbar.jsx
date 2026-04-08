import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function Navbar({ user, onLoginClick, onLogout, onNavigate }) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        gsap.fromTo(navRef.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }, []);

    const links = [
        { label: 'Home', id: 'hero' },
        { label: 'Countdown', id: 'countdown' },
        { label: 'Schedule', id: 'schedule' },
        { label: 'Find Senior', id: 'findsenior' },
        { label: 'Farewell Card', id: 'card' },
        { label: 'Events', id: 'events' },
    ];

    const handleNav = (id) => {
        setMobileOpen(false);
        onNavigate?.(id);
    };

    return (
        <nav
            ref={navRef}
            className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${scrolled ? 'glass py-2 shadow-lg shadow-black/20' : 'bg-transparent py-3'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
                <button onClick={() => handleNav('hero')} className="flex items-center gap-1.5 group">
                    <span className="text-lg md:text-xl font-serif font-bold tracking-wide text-cream group-hover:text-amber transition-colors">Nexora</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-soft"></span>
                </button>

                {/* Desktop */}
                <div className="hidden xl:flex items-center gap-4">
                    {links.map((link) => (
                        <button key={link.id} onClick={() => handleNav(link.id)}
                            className="text-[10px] font-sans text-cream/50 hover:text-amber transition-colors tracking-wider uppercase whitespace-nowrap">
                            {link.label}
                        </button>
                    ))}
                    {user ? (
                        <div className="flex items-center gap-2 ml-1">
                            <button onClick={() => onNavigate?.('admin')} className="text-[10px] text-amber font-medium tracking-wider uppercase">Dashboard</button>
                            <button onClick={onLogout} className="btn-secondary text-[9px] py-1.5 px-3">Logout</button>
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="btn-primary text-[10px] py-1.5 px-4 ml-1">Login</button>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button onClick={() => setMobileOpen(!mobileOpen)} className="xl:hidden flex flex-col gap-1 p-2">
                    <span className={`block w-5 h-[1.5px] bg-cream transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[5.5px]' : ''}`}></span>
                    <span className={`block w-5 h-[1.5px] bg-cream transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`}></span>
                    <span className={`block w-5 h-[1.5px] bg-cream transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[5.5px]' : ''}`}></span>
                </button>
            </div>

            {/* Mobile menu */}
            <div className={`xl:hidden glass overflow-hidden transition-all duration-500 ${mobileOpen ? 'max-h-[480px] py-4' : 'max-h-0'}`}>
                <div className="flex flex-col items-center gap-3 px-4">
                    {links.map((link) => (
                        <button key={link.id} onClick={() => handleNav(link.id)}
                            className="text-sm text-cream/60 hover:text-amber transition-colors tracking-wide uppercase w-full text-center py-1.5">
                            {link.label}
                        </button>
                    ))}
                    <div className="w-12 h-px bg-cream/10 my-1" />
                    {user ? (
                        <>
                            <button onClick={() => { onNavigate?.('admin'); setMobileOpen(false); }}
                                className="text-sm text-amber font-medium tracking-wide uppercase py-1.5">Dashboard</button>
                            <button onClick={() => { onLogout(); setMobileOpen(false); }} className="btn-secondary text-xs py-2 px-5">Logout</button>
                        </>
                    ) : (
                        <button onClick={() => { onLoginClick(); setMobileOpen(false); }} className="btn-primary text-xs py-2 px-6">Login</button>
                    )}
                </div>
            </div>
        </nav>
    );
}
