import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function EventCard({ event, index }) {
    const cardRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;

        const handleEnter = () => {
            gsap.to(card, {
                scale: 1.03,
                duration: 0.4,
                ease: 'power2.out',
                boxShadow: '0 20px 60px rgba(201, 169, 110, 0.12)',
            });
        };

        const handleLeave = () => {
            gsap.to(card, {
                scale: 1,
                duration: 0.4,
                ease: 'power2.out',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
            });
        };

        card.addEventListener('mouseenter', handleEnter);
        card.addEventListener('mouseleave', handleLeave);
        return () => {
            card.removeEventListener('mouseenter', handleEnter);
            card.removeEventListener('mouseleave', handleLeave);
        };
    }, []);

    const handleClick = () => {
        if (event.driveLink) {
            window.open(event.driveLink, '_blank', 'noopener,noreferrer');
        }
    };

    const placeholderGradients = [
        'from-amber-dark/30 to-rose/20',
        'from-lavender/20 to-amber/20',
        'from-rose/20 to-lavender/20',
        'from-amber/20 to-lavender/30',
    ];

    return (
        <div
            ref={cardRef}
            onClick={handleClick}
            className="glass-card overflow-hidden group cursor-pointer transition-all duration-300"
            style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
        >
            {/* Image / Gradient Placeholder */}
            <div className="relative h-48 overflow-hidden">
                {event.imageUrl ? (
                    <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div
                        className={`w-full h-full bg-gradient-to-br ${placeholderGradients[index % placeholderGradients.length]
                            } flex items-center justify-center`}
                    >
                        <span className="font-serif text-4xl text-cream/20">
                            {event.name?.charAt(0) || '✦'}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="font-serif text-lg text-cream font-medium mb-2 group-hover:text-amber-light transition-colors duration-300">
                    {event.name}
                </h3>
                <p className="text-cream/45 text-sm leading-relaxed font-sans line-clamp-3">
                    {event.description}
                </p>

                {event.driveLink && (
                    <div className="mt-4 flex items-center gap-2 text-amber/60 group-hover:text-amber transition-colors duration-300">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                        </svg>
                        <span className="text-xs tracking-wider uppercase font-sans">
                            View Memories
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
