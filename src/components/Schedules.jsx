import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

const fallbackSchedule = [
    { id: '1', date: 'April 9', title: 'Pre-Events Day 1', description: 'Decoration setup & rehearsals', time: '10:00 AM - 5:00 PM', status: 'upcoming' },
    { id: '2', date: 'April 10', title: 'Pre-Events Day 2', description: 'Cultural performances & games', time: '9:00 AM - 6:00 PM', status: 'upcoming' },
    { id: '3', date: 'April 11', title: 'The Grand Farewell', description: 'The day we celebrate, cry, and create memories forever', time: '1:00 PM - 7:00 PM', status: 'highlight' },
];

export default function Schedules() {
    const [schedule, setSchedule] = useState(fallbackSchedule);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        try {
            const q = query(collection(db, 'schedule'), orderBy('order', 'asc'));
            const unsub = onSnapshot(q, (snap) => {
                if (!snap.empty) {
                    setSchedule(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            }, () => { });
            return () => unsub();
        } catch { }
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 40 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
            if (listRef.current) {
                gsap.fromTo(listRef.current.children, { opacity: 0, x: -60, y: 20 }, {
                    opacity: 1, x: 0, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.15,
                    scrollTrigger: { trigger: listRef.current, start: 'top 85%' },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [schedule]);

    return (
        <section id="schedules" ref={sectionRef} className="section-padding relative">
            <div className="absolute top-0 left-1/3 w-[400px] h-[400px] rounded-full bg-amber/[0.02] blur-[100px] pointer-events-none" />

            <div ref={titleRef} className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-5xl text-cream font-light tracking-wide">
                    The Schedule
                </h2>
                <p className="mt-4 text-warm-gray text-sm tracking-widest uppercase font-sans">
                    Every moment, planned with love
                </p>
                <div className="ornament mt-6"><div className="ornament-icon"></div></div>
            </div>

            <div ref={listRef} className="max-w-3xl mx-auto flex flex-col gap-4">
                {schedule.map((item, i) => (
                    <div
                        key={item.id}
                        className={`glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 group transition-all duration-500 hover:border-amber/20 ${item.status === 'highlight' ? 'border-amber/15 relative overflow-hidden' : ''
                            }`}
                    >
                        {item.status === 'highlight' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-amber/[0.03] to-transparent pointer-events-none" />
                        )}

                        {/* Date Badge */}
                        <div className="flex-shrink-0 text-center md:w-24 relative z-10">
                            <span className={`block font-serif text-2xl md:text-3xl font-light ${item.status === 'highlight' ? 'text-amber' : 'text-cream/70'
                                }`}>
                                {item.date?.split(' ')[1]}
                            </span>
                            <span className="block text-[10px] text-cream/40 tracking-[0.2em] uppercase font-sans mt-1">
                                {item.date?.split(' ')[0]}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden md:block w-px h-12 bg-gradient-to-b from-transparent via-amber/20 to-transparent" />

                        {/* Content */}
                        <div className="flex-1 relative z-10">
                            <h3 className="font-serif text-lg md:text-xl text-cream font-medium group-hover:text-amber-light transition-colors duration-300">
                                {item.title}
                            </h3>
                            <p className="mt-1 text-cream/40 text-sm font-sans leading-relaxed">
                                {item.description}
                            </p>
                        </div>

                        {/* Time */}
                        <div className="flex-shrink-0 relative z-10">
                            <span className="text-xs text-amber/50 tracking-wider font-sans uppercase">
                                {item.time}
                            </span>
                        </div>

                        {item.status === 'highlight' && (
                            <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber animate-pulse-soft" />
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
