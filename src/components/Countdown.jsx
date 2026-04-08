import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FAREWELL_START = new Date('2026-04-11T13:00:00+05:30').getTime();
const FAREWELL_END = new Date('2026-04-11T19:00:00+05:30').getTime();

export default function Countdown() {
    const [timeData, setTimeData] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [phase, setPhase] = useState('before');
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const countRef = useRef(null);

    useEffect(() => {
        const tick = () => {
            const now = Date.now();
            if (now < FAREWELL_START) {
                setPhase('before');
                const diff = FAREWELL_START - now;
                setTimeData({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            } else if (now <= FAREWELL_END) {
                setPhase('during');
                const elapsed = now - FAREWELL_START;
                setTimeData({
                    days: 0,
                    hours: Math.floor((elapsed / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((elapsed / (1000 * 60)) % 60),
                    seconds: Math.floor((elapsed / 1000) % 60),
                });
            } else {
                setPhase('after');
                const diff = now - FAREWELL_END;
                setTimeData({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((diff / (1000 * 60)) % 60),
                    seconds: Math.floor((diff / 1000) % 60),
                });
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 85%' },
            });
            if (countRef.current) {
                gsap.fromTo(countRef.current.children, { opacity: 0, y: 20, scale: 0.9 }, {
                    opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.5)', stagger: 0.08,
                    scrollTrigger: { trigger: countRef.current, start: 'top 90%' },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [phase]);

    const headings = { before: 'The Farewell Awaits', during: '🎉 Happening Now!', after: 'Since We Said Goodbye' };
    const subtitles = { before: 'Every second counts', during: 'Feel every heartbeat', after: 'The memories live on' };

    const labels = phase === 'during'
        ? ['Hours', 'Minutes', 'Seconds']
        : ['Days', 'Hours', 'Minutes', 'Seconds'];

    const values = phase === 'during'
        ? [timeData.hours, timeData.minutes, timeData.seconds]
        : [timeData.days, timeData.hours, timeData.minutes, timeData.seconds];

    return (
        <section id="countdown" ref={sectionRef} className="section-padding relative min-h-[40vh] flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className={`w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-[100px] ${phase === 'during' ? 'bg-amber/[0.06]' : phase === 'after' ? 'bg-lavender/[0.04]' : 'bg-rose/[0.03]'
                    }`} />
            </div>

            <div ref={titleRef} className="text-center mb-8 md:mb-12 relative z-10">
                <h2 className="font-serif text-2xl md:text-4xl text-cream font-light tracking-wide">{headings[phase]}</h2>
                <p className="mt-2 text-warm-gray text-[10px] md:text-xs tracking-widest uppercase font-sans">{subtitles[phase]}</p>
                <div className="ornament mt-4"><div className="ornament-icon"></div></div>
            </div>

            <div ref={countRef} className="flex gap-3 md:gap-5 relative z-10">
                {values.map((val, i) => (
                    <div key={labels[i]} className="flex flex-col items-center">
                        <div className={`glass-card w-16 h-20 md:w-24 md:h-28 flex items-center justify-center relative overflow-hidden ${phase === 'during' ? 'border-amber/20' : ''
                            }`}>
                            {phase === 'during' && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber/[0.05] to-transparent animate-shimmer" />}
                            <span className={`font-serif text-2xl md:text-4xl font-light tabular-nums ${phase === 'during' ? 'text-amber' : 'text-cream/90'}`}>
                                {String(val).padStart(2, '0')}
                            </span>
                        </div>
                        <span className="mt-2 text-[8px] md:text-[10px] text-warm-gray tracking-[0.2em] uppercase font-sans">{labels[i]}</span>
                    </div>
                ))}
            </div>

            <p className="mt-6 text-cream/15 text-[10px] tracking-wider font-sans relative z-10">
                {phase === 'before' && 'April 11, 2026 • 1:00 PM'}
                {phase === 'during' && '✦ Enjoy every moment'}
                {phase === 'after' && 'Farewell was on April 11, 2026'}
            </p>
        </section>
    );
}
