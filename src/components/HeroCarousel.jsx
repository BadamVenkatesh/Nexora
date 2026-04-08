import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { toDriveImageUrl } from '../utils/driveUrl';

import hero1 from '../assets/images/hero1.png';
import hero2 from '../assets/images/hero2.png';
import hero3 from '../assets/images/hero3.png';
import hero4 from '../assets/images/hero4.png';

const defaultSlides = [
  { image: hero1, quote: 'We didn\'t realize we were making memories… we just knew we were having fun.', author: '— Winnie the Pooh' },
  { image: hero2, quote: 'Don\'t cry because it\'s over, smile because it happened.', author: '— Dr. Seuss' },
  { image: hero3, quote: 'The best things in life are the people you love and the memories you\'ve made.', author: '' },
  { image: hero4, quote: 'Every ending is just a new beginning waiting to unfold.', author: '' },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(defaultSlides);
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideRefs = useRef([]);
  const textRefs = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    try {
      const q = query(collection(db, 'highlights'), orderBy('createdAt', 'desc'));
      const unsub = onSnapshot(q, (snap) => {
        const now = Date.now();
        const adminSlides = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(h => h.createdAt?.seconds && (now - h.createdAt.seconds * 1000) < 24 * 60 * 60 * 1000)
          .map(h => ({ image: toDriveImageUrl(h.imageUrl) || '', quote: h.quote || h.title || '', author: h.author || '', isHighlight: true, badge: h.badge || '✦ Today\'s Highlight' }));
        setSlides([...adminSlides, ...defaultSlides]);
      }, (err) => { console.error('[HeroCarousel] Firestore error:', err.message); });
      return () => unsub();
    } catch (e) { console.error('[HeroCarousel] Init error:', e.message); }
  }, []);

  const goToSlide = useCallback((index) => {
    if (isTransitioning || index === current || !slideRefs.current[current] || !slideRefs.current[index]) return;
    setIsTransitioning(true);

    gsap.to(textRefs.current[current], { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' });
    gsap.to(slideRefs.current[current], { opacity: 0, scale: 1.08, duration: 1, ease: 'power2.inOut' });
    gsap.fromTo(slideRefs.current[index], { opacity: 0, scale: 1.12 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', onComplete: () => setIsTransitioning(false) });
    gsap.fromTo(textRefs.current[index], { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.4 });
    setCurrent(index);
  }, [current, isTransitioning]);

  useEffect(() => {
    intervalRef.current = setInterval(() => goToSlide((current + 1) % slides.length), 6000);
    return () => clearInterval(intervalRef.current);
  }, [current, goToSlide, slides.length]);

  useEffect(() => {
    if (slideRefs.current.length === 0) return;
    slideRefs.current.forEach((el, i) => { if (el && i > 0) gsap.set(el, { opacity: 0 }); });
    if (slideRefs.current[0]) gsap.fromTo(slideRefs.current[0], { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'power2.out' });
    if (textRefs.current[0]) gsap.fromTo(textRefs.current[0], { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.5 });
  }, [slides]);

  return (
    <section id="hero" className="relative w-full h-[100svh] overflow-hidden">
      {slides.map((slide, i) => (
        <div key={i} ref={(el) => (slideRefs.current[i] = el)} className="absolute inset-0" style={{ zIndex: current === i ? 2 : 1 }}>
          {slide.image ? (
            <img src={slide.image} alt={`Memory ${i + 1}`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-charcoal-light to-charcoal" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
          <div className="absolute inset-0 bg-charcoal/30" />
        </div>
      ))}

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-5 md:px-6">
        {slides.map((slide, i) => (
          <div key={i} ref={(el) => (textRefs.current[i] = el)}
            className={`absolute text-center max-w-[300px] md:max-w-2xl ${current === i ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{ opacity: i === 0 ? 1 : 0 }}>
            {slide.isHighlight && slide.badge && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber/10 border border-amber/20">
                <span className="text-[9px] text-amber tracking-[0.15em] uppercase font-sans font-medium">{slide.badge}</span>
              </div>
            )}
            <div className="ornament mb-5 md:mb-6"><div className="ornament-icon"></div></div>
            <blockquote className="font-serif text-lg md:text-3xl lg:text-4xl leading-snug text-cream font-light italic tracking-wide">
              &ldquo;{slide.quote}&rdquo;
            </blockquote>
            {slide.author && (
              <p className="mt-4 text-[10px] md:text-xs text-cream/35 tracking-widest uppercase font-sans">{slide.author}</p>
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2.5">
        {slides.map((slide, i) => (
          <button key={i} onClick={() => goToSlide(i)} className={`transition-all duration-500 rounded-full ${current === i ? `w-7 h-1.5 ${slide.isHighlight ? 'bg-rose' : 'bg-amber'}` : 'w-1.5 h-1.5 bg-cream/25'
            }`} />
        ))}
      </div>

      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 animate-float">
        <span className="text-[8px] text-cream/25 tracking-[0.25em] uppercase font-sans">Scroll</span>
        <div className="w-px h-6 bg-gradient-to-b from-cream/25 to-transparent" />
      </div>
    </section>
  );
}
