import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

const SONG_URL = '/song.mpeg';

const lines = [
    'Some people walk into your life…',
    'and leave footprints on your heart.',
];

export default function SplashScreen({ onComplete }) {
    const [started, setStarted] = useState(false);
    const containerRef = useRef(null);
    const tapRef = useRef(null);
    const lineRefs = useRef([]);
    const logoRef = useRef(null);
    const dotRef = useRef(null);
    const subtitleRef = useRef(null);
    const btnRef = useRef(null);
    const audioRef = useRef(null);

    // Fade-in the initial "tap to begin" prompt
    useEffect(() => {
        gsap.fromTo(containerRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
        if (tapRef.current) {
            gsap.fromTo(tapRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.3 });
        }
    }, []);

    // When user taps, start audio + animation
    const handleStart = () => {
        if (started) return;
        setStarted(true);

        // Start audio (user gesture so it will play)
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => { });
        }

        // Run the cinematic animation
        const tl = gsap.timeline();

        // Fade out tap prompt
        if (tapRef.current) {
            tl.to(tapRef.current, { opacity: 0, y: -10, duration: 0.3 });
        }

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
    };

    const handleEnter = () => {
        // Stop audio
        if (audioRef.current) {
            const audio = audioRef.current;
            const startVol = audio.volume;
            const steps = 6;
            let step = 0;
            const fade = setInterval(() => {
                step++;
                audio.volume = Math.max(0, startVol * (1 - step / steps));
                if (step >= steps) {
                    audio.pause();
                    audio.currentTime = 0;
                    clearInterval(fade);
                }
            }, 50);
        }
        gsap.to(containerRef.current, { opacity: 0, scale: 1.03, duration: 0.5, ease: 'power2.in', onComplete });
    };

    return (
        <div ref={containerRef} onClick={!started ? handleStart : undefined}
            className={`fixed inset-0 z-[10000] bg-charcoal flex flex-col items-center justify-center px-6 overflow-hidden ${!started ? 'cursor-pointer' : ''}`}
            style={{ opacity: 0 }}>

            {/* Background audio */}
            <audio ref={audioRef} src={SONG_URL} loop preload="auto" />

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

            {/* Tap to begin prompt (shown before start) */}
            {!started && (
                <div ref={tapRef} className="text-center relative z-10" style={{ opacity: 0 }}>
                    <div className="w-14 h-14 rounded-full border border-amber/30 flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
                        <svg className="w-5 h-5 text-amber/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                    </div>
                    <p className="text-cream/40 text-xs tracking-[0.2em] uppercase font-sans">Tap to begin</p>
                </div>
            )}

            {/* Poem (hidden initially, shown after start) */}
            <div className={`text-center max-w-[280px] md:max-w-sm mb-8 md:mb-10 relative z-10 ${!started ? 'hidden' : ''}`}>
                {lines.map((line, i) => (
                    <p key={i} ref={(el) => (lineRefs.current[i] = el)}
                        className="font-serif italic text-sm md:text-lg leading-relaxed text-cream/80 mb-1" style={{ opacity: 0 }}>
                        {line}
                    </p>
                ))}
            </div>

            {/* Logo (hidden initially) */}
            <div ref={logoRef} className={`text-center relative z-10 flex items-center justify-center gap-2 ${!started ? 'hidden' : ''}`} style={{ opacity: 0 }}>
                <h1 className="font-serif text-4xl md:text-7xl font-bold tracking-wider text-cream">Nexora</h1>
                <span ref={dotRef} className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-amber mt-1" style={{ opacity: 0 }}></span>
            </div>

            <p ref={subtitleRef} className={`text-cream/25 text-[9px] md:text-xs tracking-[0.3em] uppercase font-sans mt-2 md:mt-3 relative z-10 ${!started ? 'hidden' : ''}`} style={{ opacity: 0 }}>
                Where memories live on
            </p>

            <button ref={btnRef} onClick={handleEnter} className={`mt-8 md:mt-10 relative z-10 group ${!started ? 'hidden' : ''}`} style={{ opacity: 0 }}>
                <div className="px-7 py-3 rounded-full border border-amber/30 group-hover:border-amber/60 active:scale-95 transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(201,169,110,0.12)]">
                    <span className="text-[10px] tracking-[0.2em] uppercase font-sans text-amber/70 group-hover:text-amber transition-colors">Enter Nexora</span>
                </div>
            </button>
        </div>
    );
}
