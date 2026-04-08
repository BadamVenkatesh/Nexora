import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import songSrc from '../assets/song.mpeg';

const lines = [
    'Some people walk into your life…',
    'and leave footprints on your heart.',
];

export default function SplashScreen({ onComplete }) {
    const containerRef = useRef(null);
    const lineRefs = useRef([]);
    const logoRef = useRef(null);
    const dotRef = useRef(null);
    const subtitleRef = useRef(null);
    const btnRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        // Try to play audio on load
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => { });
        }

        const tl = gsap.timeline();
        tl.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });

        lineRefs.current.forEach((line) => {
            if (!line) return;
            tl.fromTo(line, { opacity: 0, y: 12, filter: 'blur(3px)' },
                { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, '-=0.1');
        });

        tl.to(lineRefs.current, { opacity: 0.25, duration: 0.3, delay: 0.3 });
        tl.fromTo(logoRef.current, { opacity: 0, scale: 0.85, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.2)' });
        tl.fromTo(dotRef.current, { scale: 0, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }, '-=0.4');
        tl.fromTo(subtitleRef.current, { opacity: 0, y: 8 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
        tl.fromTo(btnRef.current, { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });

        return () => tl.kill();
    }, []);

    const handleEnter = () => {
        // Fade out audio
        if (audioRef.current) {
            const audio = audioRef.current;
            const fadeOut = setInterval(() => {
                if (audio.volume > 0.05) {
                    audio.volume = Math.max(0, audio.volume - 0.05);
                } else {
                    audio.pause();
                    clearInterval(fadeOut);
                }
            }, 80);
        }
        gsap.to(containerRef.current, { opacity: 0, scale: 1.03, duration: 0.5, ease: 'power2.in', onComplete });
    };

    return (
        <div ref={containerRef} className="fixed inset-0 z-[10000] bg-charcoal flex flex-col items-center justify-center px-6 overflow-hidden" style={{ opacity: 0 }}>
            {/* Background audio */}
            <audio ref={audioRef} src={songSrc} loop preload="auto" />

            {/* Ambient particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="absolute w-1 h-1 rounded-full bg-amber/20"
                        style={{ left: `${15 + Math.random() * 70}%`, top: `${15 + Math.random() * 70}%`, animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />
                ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-amber/[0.03] blur-[80px]" />
            </div>

            {/* Poem */}
            <div className="text-center max-w-[280px] md:max-w-sm mb-8 md:mb-10 relative z-10">
                {lines.map((line, i) => (
                    <p key={i} ref={(el) => (lineRefs.current[i] = el)}
                        className="font-serif italic text-sm md:text-lg leading-relaxed text-cream/80 mb-1" style={{ opacity: 0 }}>
                        {line}
                    </p>
                ))}
            </div>

            {/* Logo */}
            <div ref={logoRef} className="text-center relative z-10 flex items-center justify-center gap-2" style={{ opacity: 0 }}>
                <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-wider text-cream">Nexora</h1>
                <span ref={dotRef} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber mt-1" style={{ opacity: 0 }}></span>
            </div>

            <p ref={subtitleRef} className="text-cream/25 text-[9px] md:text-xs tracking-[0.3em] uppercase font-sans mt-2 md:mt-3 relative z-10" style={{ opacity: 0 }}>
                Where memories live on
            </p>

            <button ref={btnRef} onClick={handleEnter} className="mt-8 md:mt-10 relative z-10 group" style={{ opacity: 0 }}>
                <div className="px-7 py-3 rounded-full border border-amber/30 group-hover:border-amber/60 active:scale-95 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.12)]">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-amber/70 group-hover:text-amber transition-colors">Enter Nexora</span>
                </div>
            </button>
        </div>
    );
}
