import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import html2canvas from 'html2canvas';

export default function FarewellCard({ onBack }) {
    const [image, setImage] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const pageRef = useRef(null);
    const titleRef = useRef(null);
    const cardRef = useRef(null);
    const uploadRef = useRef(null);
    const actionsRef = useRef(null);
    const fileRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '-=0.2');
        tl.fromTo(uploadRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
        return () => tl.kill();
    }, []);

    useEffect(() => {
        if (image && cardRef.current) {
            gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.92, y: 25 },
                { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: 'back.out(1.2)' });
        }
        if (image && actionsRef.current) {
            gsap.fromTo(actionsRef.current, { opacity: 0, y: 12 },
                { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', delay: 0.25 });
        }
    }, [image]);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => setImage(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    const getCanvas = async () => {
        if (!cardRef.current) return null;
        return html2canvas(cardRef.current, {
            scale: 3,
            useCORS: true,
            backgroundColor: '#151515',
            logging: false,
        });
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const canvas = await getCanvas();
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'nexora-farewell-card.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        } catch (err) {
            console.error('Download failed:', err);
        }
        setDownloading(false);
    };

    const handleShare = async () => {
        try {
            const canvas = await getCanvas();
            if (!canvas) return;
            canvas.toBlob(async (blob) => {
                if (!blob) return;
                const file = new File([blob], 'nexora-farewell-card.png', { type: 'image/png' });
                if (navigator.share && navigator.canShare?.({ files: [file] })) {
                    await navigator.share({ files: [file], title: 'Nexora Farewell Card' });
                } else {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = 'nexora-farewell-card.png';
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            }, 'image/png');
        } catch { }
    };

    const handleBack = () => {
        gsap.to(pageRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onBack });
    };

    return (
        <div ref={pageRef} className="fixed inset-0 z-[500] bg-charcoal overflow-y-auto" style={{ opacity: 0 }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-[250px] h-[250px] rounded-full bg-lavender/[0.03] blur-[80px]" />
            </div>

            <div className="fixed top-4 left-4 z-50">
                <button onClick={handleBack} className="flex items-center gap-1.5 text-cream/40 hover:text-amber transition-colors group p-1">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-[10px] tracking-wider uppercase font-sans hidden sm:inline">Back</span>
                </button>
            </div>

            <div className="min-h-screen flex flex-col items-center px-4 py-14 md:py-20">
                <div ref={titleRef} className="text-center mb-5" style={{ opacity: 0 }}>
                    <div className="ornament mb-3"><div className="ornament-icon"></div></div>
                    <h1 className="font-serif text-2xl md:text-4xl text-cream font-light italic">Farewell Card</h1>
                    <p className="mt-1.5 text-cream/35 text-[10px] md:text-xs tracking-widest uppercase font-sans">Create. Download. Share the love.</p>
                </div>

                {/* Upload */}
                <div ref={uploadRef} className="w-full max-w-[340px] mb-5" style={{ opacity: 0 }}>
                    <input type="file" ref={fileRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <button onClick={() => fileRef.current?.click()}
                        className="w-full glass-card p-4 flex items-center gap-3 group hover:border-amber/20 transition-all active:scale-[0.98]">
                        <div className="w-10 h-10 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0 group-hover:bg-amber/15 transition-colors">
                            <svg className="w-4 h-4 text-amber/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="text-left">
                            <p className="text-cream/60 text-sm font-sans">{image ? 'Change photo' : 'Upload a photo'}</p>
                            <p className="text-cream/20 text-[9px] font-sans mt-0.5">Your photo goes into the farewell card</p>
                        </div>
                    </button>
                </div>

                {/* Card Preview */}
                {image && (
                    <>
                        <div className="w-full max-w-[340px]">
                            <div
                                ref={cardRef}
                                style={{
                                    background: 'linear-gradient(160deg, #1f1b18 0%, #141210 40%, #0f0d0b 100%)',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(245,240,232,0.05)',
                                }}
                            >
                                {/* Top gold accent line */}
                                <div style={{ width: '100%', height: '3px', background: 'linear-gradient(90deg, #a88a4e, #c9a96e, #d4ba85, #c9a96e, #a88a4e)' }} />

                                {/* Photo with elegant frame */}
                                <div style={{ margin: '20px 20px 0', borderRadius: '14px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
                                    <img src={image} alt="Your photo" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    {/* Inner shadow overlay */}
                                    <div style={{ position: 'absolute', inset: 0, borderRadius: '14px', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }} />
                                </div>

                                {/* Content area */}
                                <div style={{ padding: '20px 24px 18px', textAlign: 'center' }}>
                                    {/* Nexora brand */}
                                    <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '26px', color: '#c9a96e', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '6px' }}>
                                        Nexora
                                    </p>

                                    {/* Subtitle */}
                                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', color: 'rgba(245,240,232,0.2)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        Farewell 2026
                                    </p>

                                    {/* Ornamental divider */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
                                        <div style={{ width: '28px', height: '1px', background: 'rgba(201,169,110,0.3)' }} />
                                        <div style={{ width: '4px', height: '4px', background: 'rgba(201,169,110,0.4)', transform: 'rotate(45deg)' }} />
                                        <div style={{ width: '28px', height: '1px', background: 'rgba(201,169,110,0.3)' }} />
                                    </div>

                                    {/* Main quote */}
                                    <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '12px', color: 'rgba(245,240,232,0.5)', fontStyle: 'italic', lineHeight: '1.7', marginBottom: '16px', maxWidth: '260px', marginLeft: 'auto', marginRight: 'auto' }}>
                                        &ldquo;You may leave, but you&rsquo;ll always stay in our hearts&rdquo;
                                    </p>

                                    {/* Bottom section with signature */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                        {/* Small heart */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ fontSize: '10px', opacity: 0.3 }}>♡</span>
                                            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', color: 'rgba(245,240,232,0.15)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                                                Made with love
                                            </p>
                                        </div>

                                        {/* B21 signature */}
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', color: 'rgba(245,240,232,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '2px' }}>
                                                With love,
                                            </p>
                                            <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '18px', color: '#c9a96e', fontWeight: 600, letterSpacing: '0.05em' }}>
                                                B21
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom accent */}
                                <div style={{ width: '100%', height: '2px', background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.1), transparent)' }} />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div ref={actionsRef} className="flex gap-3 mt-5 w-full max-w-[340px]" style={{ opacity: 0 }}>
                            <button onClick={handleDownload} disabled={downloading}
                                className="flex-1 btn-primary flex items-center justify-center gap-2 py-3 text-xs disabled:opacity-50">
                                {downloading ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0 0l-4-4m4 4l4-4" />
                                        </svg>
                                        Download
                                    </>
                                )}
                            </button>
                            <button onClick={handleShare}
                                className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3 text-xs">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                </svg>
                                Share
                            </button>
                        </div>
                    </>
                )}

                {/* Empty state hint */}
                {!image && (
                    <div className="mt-4 text-center max-w-[280px]">
                        <p className="text-cream/10 text-[10px] font-sans italic leading-relaxed">
                            Upload a photo and create a farewell card that captures the beauty of goodbye.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
