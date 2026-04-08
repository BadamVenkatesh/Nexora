import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef(null);
    const textRef = useRef(null);
    const [audioCtx, setAudioCtx] = useState(null);
    const [playing, setPlaying] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(textRef.current, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: footerRef.current, start: 'top 85%' },
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

    const toggleSound = () => {
        if (playing && audioCtx) {
            audioCtx.close();
            setAudioCtx(null);
            setPlaying(false);
            return;
        }
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(220, ctx.currentTime);
            gain.gain.setValueAtTime(0.03, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            setAudioCtx(ctx);
            setPlaying(true);
        } catch { }
    };

    return (
        <footer ref={footerRef} className="section-padding relative flex flex-col items-center justify-center min-h-[40vh]">
            <div ref={textRef} className="text-center max-w-md px-4">
                <div className="ornament mb-4"><div className="ornament-icon"></div></div>
                <h2 className="font-serif text-2xl md:text-4xl text-cream/80 font-light italic leading-snug">
                    This is not goodbye.
                </h2>
                <h2 className="font-serif text-2xl md:text-4xl text-amber/60 font-light italic leading-snug mt-1">
                    Just see you later.
                </h2>

                <button onClick={toggleSound}
                    className="mt-6 flex items-center gap-2 mx-auto text-cream/20 hover:text-cream/40 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={playing
                            ? 'M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z'
                            : 'M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z'
                        } />
                    </svg>
                    <span className="text-[9px] tracking-[0.2em] uppercase font-sans">Ambient Sound</span>
                </button>

                <div className="mt-8 text-cream/15 text-[10px] tracking-wider font-sans">
                    <p>Made with ♡ by Nexora</p>
                    <p className="mt-1 text-cream/10">A farewell letter turned into a website.</p>
                </div>
            </div>
        </footer>
    );
}
