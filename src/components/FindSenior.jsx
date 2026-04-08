import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import * as XLSX from 'xlsx';
import mappingFile from '../assets/farewell_mapping.xlsx?url';

export default function FindSenior({ onBack }) {
    const [studentId, setStudentId] = useState('');
    const [result, setResult] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [searching, setSearching] = useState(false);
    const [mapping, setMapping] = useState([]);
    const pageRef = useRef(null);
    const formRef = useRef(null);
    const resultRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const backRef = useRef(null);
    const particlesRef = useRef(null);

    // Load Excel mapping
    useEffect(() => {
        fetch(mappingFile)
            .then(res => res.arrayBuffer())
            .then(data => {
                const wb = XLSX.read(data, { type: 'array' });
                const ws = wb.Sheets[wb.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(ws);
                const mapped = json.map(row => ({
                    seniorId: String(row['Senior ID'] || '').trim(),
                    seniorName: String(row['Senior Name'] || '').trim(),
                    juniorId: String(row['Junior ID'] || '').trim(),
                    juniorName: String(row['Junior Name'] || '').trim(),
                }));
                setMapping(mapped);
            })
            .catch(() => {
                // Fallback hardcoded data
                setMapping([
                    { seniorId: 'B200013', seniorName: 'KALLEPELLY AKHIL', juniorId: 'B210001', juniorName: 'ADAPA ANIL KUMAR' },
                    { seniorId: 'B200032', seniorName: 'DHARAVATH SRAVANI', juniorId: 'B210007', juniorName: 'NYALAPALLY SAIKIRAN' },
                    { seniorId: 'B200039', seniorName: 'KORRA PRAVEEN', juniorId: 'B210013', juniorName: 'MYANA VENKATAKRISHNA' },
                    { seniorId: 'B200101', seniorName: 'BODA RAJESH', juniorId: 'B210020', juniorName: 'BODDULA SUNANDHA' },
                    { seniorId: 'B200112', seniorName: 'SIDDA RENU', juniorId: 'B210026', juniorName: 'PERUMANDLA SIDDU' },
                    { seniorId: 'B200122', seniorName: 'BHUKYA PAVAN', juniorId: 'B210031', juniorName: 'THONTA KRUTHIKA' },
                    { seniorId: 'B200149', seniorName: 'VANKUDOTHU MAHESH', juniorId: 'B210050', juniorName: 'SIRIPURAM KOUSHIK' },
                ]);
            });
    }, []);

    // Page entrance
    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(pageRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
        tl.fromTo(backRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2');
        tl.fromTo(titleRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.2');
        tl.fromTo(subtitleRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3');
        tl.fromTo(formRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2');
        return () => tl.kill();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!studentId.trim()) return;
        setSearching(true);
        setResult(null);
        setNotFound(false);

        await new Promise(r => setTimeout(r, 1200));

        const id = studentId.trim().toUpperCase();
        const match = mapping.find(m => m.juniorId.toUpperCase() === id || m.seniorId.toUpperCase() === id);
        setSearching(false);

        if (match) {
            const isJunior = match.juniorId.toUpperCase() === id;
            setResult({ ...match, isJunior });

            setTimeout(() => {
                if (resultRef.current) {
                    const tl = gsap.timeline();
                    tl.fromTo(resultRef.current, { opacity: 0, y: 40, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.2)' });
                    const children = resultRef.current.querySelectorAll('.reveal-item');
                    tl.fromTo(children, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power3.out' }, '-=0.4');
                    if (particlesRef.current) {
                        const ps = particlesRef.current.children;
                        gsap.fromTo(ps, { scale: 0, opacity: 0 }, {
                            scale: 1, opacity: 1, duration: 0.6, stagger: 0.03, ease: 'back.out(2)',
                            onComplete: () => gsap.to(ps, { y: -80, opacity: 0, duration: 1.5, stagger: 0.06, ease: 'power1.out' }),
                        });
                    }
                }
            }, 50);
        } else {
            setNotFound(true);
        }
    };

    const handleBack = () => {
        gsap.to(pageRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onBack });
    };

    return (
        <div ref={pageRef} className="fixed inset-0 z-[500] bg-charcoal overflow-y-auto" style={{ opacity: 0 }}>
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-rose/[0.03] blur-[100px]" />
                <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full bg-amber/[0.03] blur-[80px]" />
            </div>

            {/* Back */}
            <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50" ref={backRef} style={{ opacity: 0 }}>
                <button onClick={handleBack} className="flex items-center gap-1.5 text-cream/40 hover:text-amber transition-colors group p-2">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="text-[10px] tracking-wider uppercase font-sans hidden sm:inline">Back to Nexora</span>
                </button>
            </div>

            <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16">
                <div ref={titleRef} className="text-center mb-3" style={{ opacity: 0 }}>
                    <div className="ornament mb-4"><div className="ornament-icon"></div></div>
                    <h1 className="font-serif text-3xl md:text-5xl text-cream font-light italic">Find Your Senior</h1>
                </div>

                <p ref={subtitleRef} className="text-center text-cream/40 text-xs md:text-sm font-sans max-w-sm leading-relaxed mb-8" style={{ opacity: 0 }}>
                    Enter your ID to discover who you&rsquo;ll be taking care of at the farewell.
                </p>

                <div ref={formRef} className="w-full max-w-sm" style={{ opacity: 0 }}>
                    <form onSubmit={handleSearch} className="glass-card p-5 md:p-6">
                        <label className="block text-[10px] text-cream/40 tracking-wider uppercase font-sans mb-2">Your Student ID</label>
                        <div className="flex gap-2">
                            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="input-field flex-1 text-sm" placeholder="e.g. B210001" required />
                            <button type="submit" disabled={searching} className="btn-primary flex-shrink-0 text-xs px-5 disabled:opacity-50">
                                {searching ? (
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span className="hidden sm:inline">Finding</span>
                                    </span>
                                ) : 'Find'}
                            </button>
                        </div>
                    </form>
                </div>

                {notFound && (
                    <div className="mt-6 glass-card p-5 max-w-sm w-full text-center">
                        <p className="text-cream/50 text-xs font-sans">No match for <span className="text-amber">{studentId.toUpperCase()}</span>. Check your ID.</p>
                    </div>
                )}

                {result && (
                    <div className="relative mt-8 w-full max-w-sm">
                        <div ref={particlesRef} className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            {[...Array(16)].map((_, i) => (
                                <div key={i} className="absolute w-1 h-1 rounded-full"
                                    style={{ background: ['#c9a96e', '#b8707a', '#9b8ec4', '#d4ba85'][i % 4], left: `${25 + Math.random() * 50}%`, top: `${25 + Math.random() * 50}%`, opacity: 0 }} />
                            ))}
                        </div>

                        <div ref={resultRef} className="glass-card p-6 md:p-8 border-amber/15 relative overflow-hidden" style={{ opacity: 0 }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-amber/[0.03] via-transparent to-rose/[0.02] pointer-events-none" />
                            <div className="relative z-10">
                                <div className="reveal-item text-center mb-6">
                                    <span className="text-3xl mb-2 block">🤝</span>
                                    <p className="text-cream/40 text-[10px] tracking-[0.25em] uppercase font-sans">
                                        {result.isJunior ? 'Your Senior Is' : 'Your Junior Is'}
                                    </p>
                                </div>

                                <div className="reveal-item text-center mb-6">
                                    <h2 className="font-serif text-2xl md:text-3xl text-amber font-medium italic">
                                        {result.isJunior ? result.seniorName : result.juniorName}
                                    </h2>
                                    <p className="mt-1.5 text-cream/25 text-[10px] tracking-wider font-sans">
                                        ID: {result.isJunior ? result.seniorId : result.juniorId}
                                    </p>
                                </div>

                                <div className="reveal-item ornament my-5"><div className="ornament-icon"></div></div>

                                <div className="reveal-item glass-light rounded-xl p-4">
                                    <div className="flex items-center justify-center gap-4">
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] text-cream/30 tracking-wider uppercase font-sans mb-1">You</p>
                                            <p className="font-serif text-sm text-cream/70">{result.isJunior ? result.juniorName : result.seniorName}</p>
                                        </div>
                                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                            <div className="w-6 h-px bg-amber/30" />
                                            <span className="text-amber/50 text-[10px]">♡</span>
                                            <div className="w-6 h-px bg-amber/30" />
                                        </div>
                                        <div className="text-center flex-1">
                                            <p className="text-[9px] text-cream/30 tracking-wider uppercase font-sans mb-1">{result.isJunior ? 'Senior' : 'Junior'}</p>
                                            <p className="font-serif text-sm text-cream/70">{result.isJunior ? result.seniorName : result.juniorName}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="reveal-item mt-6 text-center">
                                    <p className="font-serif text-xs text-cream/35 italic leading-relaxed">
                                        &ldquo;Make their last days special. You&rsquo;re not just a junior — you&rsquo;re the one who makes this farewell unforgettable.&rdquo;
                                    </p>
                                </div>

                                <div className="reveal-item mt-5 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-amber/10 border border-amber/15">
                                        <span className="text-[9px] text-amber/80 tracking-wider uppercase font-sans">🎉 April 11, 2026</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
