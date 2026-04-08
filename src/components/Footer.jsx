import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
    const footerRef = useRef(null);
    const textRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(textRef.current, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: footerRef.current, start: 'top 85%' },
            });
        }, footerRef);
        return () => ctx.revert();
    }, []);

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

                <div className="mt-8 text-cream/15 text-[10px] tracking-wider font-sans">
                    <p>Made with ♡ by Nexora</p>
                    <p className="mt-1 text-cream/10">A farewell letter turned into a website.</p>
                </div>
            </div>
        </footer>
    );
}
