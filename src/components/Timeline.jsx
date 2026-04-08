import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

export default function Timeline() {
    const [memories, setMemories] = useState([]);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const lineRef = useRef(null);
    const itemRefs = useRef([]);

    // Firestore listener
    useEffect(() => {
        try {
            const q = query(collection(db, 'timeline'), orderBy('order', 'asc'));
            const unsub = onSnapshot(q, (snap) => {
                if (!snap.empty) {
                    setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                }
            }, () => { });
            return () => unsub();
        } catch { }
    }, []);

    // GSAP
    useEffect(() => {
        if (memories.length === 0) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(titleRef.current, { opacity: 0, y: 40 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
            });
            gsap.fromTo(lineRef.current, { scaleY: 0 }, {
                scaleY: 1, duration: 1.5, ease: 'power2.out', transformOrigin: 'top center',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 60%' },
            });
            itemRefs.current.forEach((item, i) => {
                if (!item) return;
                const isLeft = i % 2 === 0;
                gsap.fromTo(item, { opacity: 0, x: isLeft ? -60 : 60, y: 20 }, {
                    opacity: 1, x: 0, y: 0, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: item, start: 'top 85%', toggleActions: 'play none none reverse' },
                });
            });
        }, sectionRef);
        return () => ctx.revert();
    }, [memories]);

    if (memories.length === 0) {
        return (
            <section id="timeline" ref={sectionRef} className="section-padding relative">
                <div ref={titleRef} className="text-center mb-16">
                    <h2 className="font-serif text-3xl md:text-5xl text-cream font-light tracking-wide">
                        Our Journey
                    </h2>
                    <p className="mt-4 text-warm-gray text-sm tracking-widest uppercase font-sans">
                        Moments that defined us
                    </p>
                    <div className="ornament mt-6"><div className="ornament-icon"></div></div>
                </div>
                <div className="text-center">
                    <p className="text-cream/20 text-sm font-sans italic">
                        Memories are being gathered... Stay tuned ✦
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section id="timeline" ref={sectionRef} className="section-padding relative">
            <div ref={titleRef} className="text-center mb-20">
                <h2 className="font-serif text-3xl md:text-5xl text-cream font-light tracking-wide">
                    Our Journey
                </h2>
                <p className="mt-4 text-warm-gray text-sm tracking-widest uppercase font-sans">
                    Moments that defined us
                </p>
                <div className="ornament mt-6"><div className="ornament-icon"></div></div>
            </div>

            <div className="relative max-w-4xl mx-auto">
                <div ref={lineRef} className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-amber/40 via-amber/20 to-transparent hidden md:block" />

                <div className="flex flex-col gap-12 md:gap-16">
                    {memories.map((memory, i) => {
                        const isLeft = i % 2 === 0;
                        return (
                            <div
                                key={memory.id}
                                ref={(el) => (itemRefs.current[i] = el)}
                                className={`relative flex flex-col md:flex-row items-center gap-6 ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
                                    }`}
                            >
                                <div className={`w-full md:w-[calc(50%-40px)] glass-card p-6 md:p-8 group hover:border-amber/20 transition-all duration-500 ${isLeft ? 'md:text-right' : 'md:text-left'
                                    }`}>
                                    <span className="inline-block text-[10px] text-amber tracking-[0.3em] uppercase font-sans mb-3 font-medium">
                                        {memory.tag || memory.year || ''}
                                    </span>
                                    <h3 className="font-serif text-xl md:text-2xl text-cream font-medium mb-3 group-hover:text-amber-light transition-colors duration-300">
                                        {memory.title}
                                    </h3>
                                    <p className="text-cream/50 text-sm leading-relaxed font-sans">
                                        {memory.description}
                                    </p>
                                </div>
                                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-charcoal border-2 border-amber/50 z-10" />
                                <div className="hidden md:block w-[calc(50%-40px)]" />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
