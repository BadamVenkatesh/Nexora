import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

const defaultSchedule = [
    { id: 'default-1', date: 'April 9', title: 'Pre-Events Day 1', description: 'Decoration setup, stage preparation, and rehearsals.', time: '10:00 AM - 5:00 PM', status: 'upcoming' },
    { id: 'default-2', date: 'April 10', title: 'Pre-Events Day 2', description: 'Cultural performances, games, and final preparations.', time: '9:00 AM - 6:00 PM', status: 'upcoming' },
    { id: 'default-3', date: 'April 11', title: 'The Grand Farewell', description: 'The day we celebrate and create memories forever.', time: '1:00 PM - 7:00 PM', status: 'highlight' },
];

export default function SchedulePage({ onBack }) {
    const [schedule, setSchedule] = useState([]);
    const [firestoreLoaded, setFirestoreLoaded] = useState(false);
    const pageRef = useRef(null);
    const titleRef = useRef(null);
    const listRef = useRef(null);
    const backRef = useRef(null);

    // Firestore real-time listener — admin controls what users see
    useEffect(() => {
        try {
            const q = query(collection(db, 'schedule'), orderBy('order', 'asc'));
            const unsub = onSnapshot(q, (snap) => {
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                // Use Firestore data if admin has added any, otherwise show defaults
                setSchedule(data.length > 0 ? data : defaultSchedule);
                setFirestoreLoaded(true);
            }, (err) => {
                console.error('[Schedule] Firestore error:', err.message);
                setSchedule(defaultSchedule);
                setFirestoreLoaded(true);
            });
            return () => unsub();
        } catch {
            setSchedule(defaultSchedule);
            setFirestoreLoaded(true);
        }
    }, []);

    // GSAP entrance
    useEffect(() => {
        if (!firestoreLoaded) return;
        const tl = gsap.timeline();
        tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        tl.fromTo(backRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
        tl.fromTo(titleRef.current, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');
        if (listRef.current?.children?.length) {
            tl.fromTo(listRef.current.children, { opacity: 0, x: -25, y: 10 }, {
                opacity: 1, x: 0, y: 0, duration: 0.5, ease: 'power3.out', stagger: 0.1,
            }, '-=0.2');
        }
        return () => tl.kill();
    }, [firestoreLoaded, schedule]);

    const handleBack = () => {
        gsap.to(pageRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onBack });
    };

    if (!firestoreLoaded) return null;

    return (
        <div ref={pageRef} className="fixed inset-0 z-[500] bg-charcoal overflow-y-auto" style={{ opacity: 0 }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-amber/[0.03] blur-[80px]" />
            </div>

            <div className="fixed top-4 left-4 z-50" ref={backRef} style={{ opacity: 0 }}>
                <button onClick={handleBack} className="flex items-center gap-1.5 text-cream/40 hover:text-amber transition-colors group p-1">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-[10px] tracking-wider uppercase font-sans hidden sm:inline">Back</span>
                </button>
            </div>

            <div className="max-w-2xl mx-auto py-16 px-4 md:px-6">
                <div ref={titleRef} className="text-center mb-8 md:mb-12" style={{ opacity: 0 }}>
                    <div className="ornament mb-3"><div className="ornament-icon"></div></div>
                    <h1 className="font-serif text-2xl md:text-4xl text-cream font-light italic">The Schedule</h1>
                    <p className="mt-2 text-warm-gray text-[10px] md:text-xs tracking-widest uppercase font-sans">Every moment, planned with love</p>
                </div>

                <div ref={listRef} className="flex flex-col gap-4">
                    {schedule.map((item) => (
                        <div key={item.id}
                            className={`glass-card p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 group transition-all duration-500 hover:border-amber/20 relative overflow-hidden ${item.status === 'highlight' ? 'border-amber/15' : ''
                                }`}>
                            {item.status === 'highlight' && <div className="absolute inset-0 bg-gradient-to-r from-amber/[0.04] to-transparent pointer-events-none" />}

                            <div className="flex-shrink-0 relative z-10 flex sm:flex-col items-center sm:items-center gap-2 sm:gap-0 sm:w-16">
                                <span className={`font-serif text-xl md:text-2xl font-light ${item.status === 'highlight' ? 'text-amber' : 'text-cream/60'}`}>
                                    {item.date?.split(' ')[1]}
                                </span>
                                <span className="text-[8px] text-cream/35 tracking-[0.2em] uppercase font-sans">{item.date?.split(' ')[0]}</span>
                            </div>

                            <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-amber/20 to-transparent flex-shrink-0" />

                            <div className="flex-1 relative z-10 min-w-0">
                                <h3 className="font-serif text-sm md:text-base text-cream font-medium group-hover:text-amber-light transition-colors">{item.title}</h3>
                                <p className="mt-1 text-cream/30 text-xs font-sans leading-relaxed">{item.description}</p>
                            </div>

                            <div className="flex-shrink-0 relative z-10">
                                <span className="text-[9px] text-amber/45 tracking-wider font-sans">{item.time}</span>
                            </div>

                            {item.status === 'highlight' && (
                                <div className="absolute top-2.5 right-3 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-soft" />
                                    <span className="text-[7px] text-amber/35 tracking-wider uppercase font-sans hidden sm:inline">Main</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
