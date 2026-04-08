import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import EventCard from './EventCard';

gsap.registerPlugin(ScrollTrigger);

export default function EventsGrid() {
    const [events, setEvents] = useState([]);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const gridRef = useRef(null);

    // Firebase listener — only show admin-added events
    useEffect(() => {
        try {
            const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
            const unsub = onSnapshot(q, (snapshot) => {
                setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
            }, () => { });
            return () => unsub();
        } catch { }
    }, []);

    // GSAP
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 40 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
            if (gridRef.current && gridRef.current.children.length > 0) {
                gsap.fromTo(gridRef.current.children, { opacity: 0, y: 60, scale: 0.95 }, {
                    opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12,
                    scrollTrigger: { trigger: gridRef.current, start: 'top 80%' },
                });
            }
        }, sectionRef);
        return () => ctx.revert();
    }, [events]);

    return (
        <section id="events" ref={sectionRef} className="section-padding relative">
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] rounded-full bg-lavender/[0.03] blur-3xl pointer-events-none" />

            <div ref={titleRef} className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-5xl text-cream font-light tracking-wide">
                    Shared Moments
                </h2>
                <p className="mt-4 text-warm-gray text-sm tracking-widest uppercase font-sans">
                    Click to revisit the memories
                </p>
                <div className="ornament mt-6"><div className="ornament-icon"></div></div>
            </div>

            {events.length === 0 ? (
                <div className="text-center max-w-lg mx-auto">
                    <div className="glass-card p-12 flex flex-col items-center gap-4">
                        <span className="text-4xl">✦</span>
                        <p className="text-cream/30 text-sm font-sans italic leading-relaxed">
                            The best moments are yet to be shared.<br />
                            Stay close — memories are on their way.
                        </p>
                    </div>
                </div>
            ) : (
                <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {events.map((event, i) => (
                        <EventCard key={event.id} event={event} index={i} />
                    ))}
                </div>
            )}
        </section>
    );
}
