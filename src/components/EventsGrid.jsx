import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from './EventCard';

gsap.registerPlugin(ScrollTrigger);

export default function EventsGrid() {
    const [events, setEvents] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const gridRef = useRef(null);

    // Firestore real-time listener — always reflects admin state
    useEffect(() => {
        try {
            const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
            const unsub = onSnapshot(q, (snapshot) => {
                setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
                setLoaded(true);
            }, (err) => { console.error('[EventsGrid] Firestore error:', err.message); setLoaded(true); });
            return () => unsub();
        } catch (e) { console.error('[EventsGrid] Init error:', e.message); setLoaded(true); }
    }, []);

    // GSAP
    useEffect(() => {
        if (!loaded) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
            if (gridRef.current && gridRef.current.children.length > 0) {
                gsap.fromTo(gridRef.current.children, { opacity: 0, y: 40, scale: 0.95 }, {
                    opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1,
                    scrollTrigger: { trigger: gridRef.current, start: 'top 82%' },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [events, loaded]);

    if (!loaded) return null;

    return (
        <section id="events" ref={sectionRef} className="section-padding relative">
            <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-lavender/[0.03] blur-3xl pointer-events-none" />

            <div ref={titleRef} className="text-center mb-8 md:mb-12">
                <h2 className="font-serif text-2xl md:text-4xl text-cream font-light tracking-wide">Shared Moments</h2>
                <p className="mt-2 text-warm-gray text-[10px] md:text-xs tracking-widest uppercase font-sans">Click to revisit the memories</p>
                <div className="ornament mt-4"><div className="ornament-icon"></div></div>
            </div>

            {events.length === 0 ? (
                <div className="text-center max-w-sm mx-auto">
                    <div className="glass-card p-8 flex flex-col items-center gap-3">
                        <span className="text-3xl">✦</span>
                        <p className="text-cream/25 text-xs font-sans italic leading-relaxed">
                            The best moments are yet to be shared.<br />Stay close — memories are on their way.
                        </p>
                    </div>
                </div>
            ) : (
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </section>
    );
}
