import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function EventCard({ event }) {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;

        const handleEnter = () => gsap.to(card, { y: -4, duration: 0.3, ease: 'power2.out' });
        const handleLeave = () => gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });

        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);
        return () => {
            card.removeEventListener('mouseenter', handleEnter);
            card.removeEventListener('mouseleave', handleLeave);
        };
    }, []);

    const initial = (event.name || event.title || 'E')[0].toUpperCase();

    const handleClick = () => {
        if (event.driveLink) window.open(event.driveLink, '_blank');
    };

    return (
        <div
            ref={cardRef}
            onClick={handleClick}
            className={`glass-card overflow-hidden group transition-all duration-500 hover:border-amber/20 ${event.driveLink ? 'cursor-pointer' : ''}`}
        >
            {/* Image / Placeholder */}
            <div className="relative h-32 md:h-40 overflow-hidden">
                {event.imageUrl ? (
                    <img src={event.imageUrl} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-charcoal-lighter to-charcoal flex items-center justify-center">
                        <span className="text-3xl md:text-4xl font-serif text-cream/10 font-light">{initial}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-serif text-sm md:text-base text-cream font-medium group-hover:text-amber-light transition-colors line-clamp-1">
                    {event.name || event.title}
                </h3>
                <p className="mt-1.5 text-cream/35 text-xs font-sans leading-relaxed line-clamp-2">
                    {event.description}
                </p>
                {event.driveLink && (
                    <div className="mt-3 flex items-center gap-1.5 text-amber/40 group-hover:text-amber/70 transition-colors">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        </svg>
                        <span className="text-[10px] tracking-wider uppercase font-sans">View Memories</span>
                    </div>
                )}
            </div>
        </div>
    );
}
