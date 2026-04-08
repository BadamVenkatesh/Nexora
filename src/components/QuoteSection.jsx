import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function QuoteSection() {
    const sectionRef = useRef(null);
    const quoteRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                quoteRef.current,
                { opacity: 0, y: 30, scale: 0.97 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out',
                    scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', toggleActions: 'play none none reverse' },
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="section-padding relative flex items-center justify-center min-h-[30vh]">
            <div ref={quoteRef} className="text-center max-w-xl px-4">
                <div className="ornament mb-4 md:mb-6"><div className="ornament-icon"></div></div>
                <blockquote className="font-serif text-lg md:text-2xl lg:text-3xl leading-snug text-cream/70 font-light italic">
                    &ldquo;Sometimes you will never know the value of something, until it becomes a memory.&rdquo;
                </blockquote>
                <p className="mt-3 md:mt-4 text-cream/25 text-[10px] tracking-[0.25em] uppercase font-sans">&mdash; Nexora</p>
                <div className="ornament mt-4 md:mt-6"><div className="ornament-icon"></div></div>
            </div>
        </section>
    );
}
