import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

export default function Timeline() {
    const [memories, setMemories] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const lineRef = useRef(null);
    const itemRefs = useRef([]);

    // Firestore real-time listener — always reflects admin state
    useEffect(() => {
        try {
            const q = query(collection(db, 'timeline'), orderBy('order', 'asc'));
            const unsub = onSnapshot(q, (snap) => {
                setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoaded(true);
            }, (err) => { console.error('[Timeline] Firestore error:', err.message); setLoaded(true); });
            return () => unsub();
        } catch (e) { console.error('[Timeline] Init error:', e.message); setLoaded(true); }
    }, []);

    // GSAP animations
    useEffect(() => {
        if (memories.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
            if (lineRef.current) {
                gsap.fromTo(lineRef.current, { scaleY: 0 }, {
                    scaleY: 1, duration: 1.2, ease: 'power2.out', transformOrigin: 'top center',
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
                });
            }
            itemRefs.current.forEach((item, i) => {
                if (!item) return;
                const isLeft = i % 2 === 0;
                gsap.fromTo(item, { opacity: 0, x: isLeft ? -40 : 40, y: 15 }, {
                    opacity: 1, x: 0, y: 0, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none reverse' },
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, [memories]);

    if (!loaded) return null;

    if (memories.length === 0) {
        return (
            <section id="timeline" ref={sectionRef} className="section-padding relative">
                <div className="text-center mb-8 md:mb-12">
                    <h2 className="font-serif text-2xl md:text-4xl text-cream font-light tracking-wide">Our Journey</h2>
                    <p className="mt-2 text-warm-gray text-[10px] md:text-xs tracking-widest uppercase font-sans">Moments that defined us</p>
                    <div className="ornament mt-4"><div className="ornament-icon"></div></div>
                </div>
                <div className="text-center">
                    <p className="text-cream/20 text-xs font-sans italic">Memories are being gathered... Stay tuned ✦</p>
                </div>
            </section>
        );
    }

    return (
        <section id="timeline" ref={sectionRef} className="section-padding relative">
            <div ref={titleRef} className="text-center mb-10 md:mb-16">
                <h2 className="font-serif text-2xl md:text-4xl text-cream font-light tracking-wide">Our Journey</h2>
                <p className="mt-2 text-warm-gray text-[10px] md:text-xs tracking-widest uppercase font-sans">Moments that defined us</p>
                <div className="ornament mt-4"><div className="ornament-icon"></div></div>
            </div>

            <div className="relative max-w-4xl mx-auto">
                {/* Timeline line — hidden on mobile */}
                <div ref={lineRef} className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber/40 via-amber/20 to-transparent hidden md:block" />

                <div className="flex flex-col gap-6 md:gap-12">
                    {memories.map((memory, i) => {
                        const isLeft = i % 2 === 0;
                        return (
                            <div
                                key={memory.id}
                                ref={(el) => (itemRefs.current[i] = el)}
                                className={`relative flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                            >
                                <div className={`w-full md:w-[calc(50%-32px)] glass-card p-5 md:p-6 group hover:border-amber/20 transition-all duration-500 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                                    <span className="inline-block text-[9px] text-amber tracking-[0.25em] uppercase font-sans mb-2 font-medium">
                                        {memory.tag || memory.year || ''}
                                    </span>
                                    <h3 className="font-serif text-base md:text-xl text-cream font-medium mb-2 group-hover:text-amber-light transition-colors">
                                        {memory.title}
                                    </h3>
                                    <p className="text-cream/40 text-xs md:text-sm leading-relaxed font-sans">{memory.description}</p>
                                </div>
                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-charcoal border-2 border-amber/50 z-10" />
                                <div className="hidden md:block w-[calc(50%-32px)]" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
