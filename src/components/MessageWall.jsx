import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    collection,
    addDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    limit,
} from 'firebase/firestore';
import { db } from '../firebase';

gsap.registerPlugin(ScrollTrigger);

const fallbackMessages = [
    { id: '1', name: 'Ananya', message: 'You taught me that friendship doesn\'t need words — just presence. I\'ll miss you.' },
    { id: '2', name: 'Rahul', message: 'From late-night debugging to early morning chai, every moment was worth it.' },
    { id: '3', name: 'Priya', message: 'Thank you for being the kind of senior who made college feel like home.' },
    { id: '4', name: 'Arjun', message: 'The campus will feel empty without your laughter echoing in the corridors.' },
    { id: '5', name: 'Meera', message: 'You didn\'t just leave — you left behind a legacy of kindness and courage.' },
    { id: '6', name: 'Kabir', message: 'Here\'s to the sleepless nights that became our best memories. Goodluck!' },
];

export default function MessageWall() {
    const [messages, setMessages] = useState(fallbackMessages);
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const wallRef = useRef(null);

    // Firebase listener
    useEffect(() => {
        try {
            const q = query(
                collection(db, 'messages'),
                orderBy('createdAt', 'desc'),
                limit(30)
            );
            const unsub = onSnapshot(
                q,
                (snapshot) => {
                    if (!snapshot.empty) {
                        setMessages(
                            snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
                        );
                    }
                },
                () => { }
            );
            return () => unsub();
        } catch { }
    }, []);

    // GSAP
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 80%',
                    },
                }
            );

            if (wallRef.current) {
                gsap.fromTo(
                    wallRef.current.children,
                    { opacity: 0, y: 30, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.5,
                        ease: 'power3.out',
                        stagger: 0.08,
                        scrollTrigger: {
                            trigger: wallRef.current,
                            start: 'top 85%',
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) return;
        setSending(true);

        try {
            await addDoc(collection(db, 'messages'), {
                name: name.trim(),
                message: text.trim(),
                createdAt: serverTimestamp(),
            });
            setSent(true);
            setName('');
            setText('');
            setTimeout(() => setSent(false), 3000);
        } catch {
            // Firebase not configured, show local
            setMessages((prev) => [
                { id: Date.now().toString(), name: name.trim(), message: text.trim() },
                ...prev,
            ]);
            setSent(true);
            setName('');
            setText('');
            setTimeout(() => setSent(false), 3000);
        } finally {
            setSending(false);
        }
    };

    const cardColors = [
        'border-amber/10 hover:border-amber/25',
        'border-rose/10 hover:border-rose/25',
        'border-lavender/10 hover:border-lavender/25',
    ];

    return (
        <section
            id="messages"
            ref={sectionRef}
            className="section-padding relative"
        >
            {/* Ambient glow */}
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-rose/[0.02] blur-3xl pointer-events-none" />

            <div ref={titleRef} className="text-center mb-16">
                <h2 className="font-serif text-3xl md:text-5xl text-cream font-light tracking-wide">
                    Messages for Seniors
                </h2>
                <p className="mt-4 text-warm-gray text-sm tracking-widest uppercase font-sans">
                    Leave a note. Make it count.
                </p>
                <div className="ornament mt-6">
                    <div className="ornament-icon"></div>
                </div>
            </div>

            {/* Input Form */}
            <div className="max-w-xl mx-auto mb-14">
                <form onSubmit={handleSubmit} className="glass-card p-6 flex flex-col gap-4">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="Your name"
                        required
                    />
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="input-field min-h-[100px] resize-none"
                        placeholder="Write something heartfelt..."
                        required
                    />
                    <button
                        type="submit"
                        disabled={sending}
                        className="btn-primary self-end disabled:opacity-50"
                    >
                        {sending ? 'Sending...' : sent ? '✓ Sent!' : 'Send Message'}
                    </button>
                </form>
            </div>

            {/* Message Wall */}
            <div
                ref={wallRef}
                className="columns-1 sm:columns-2 lg:columns-3 gap-4 max-w-5xl mx-auto [column-fill:_balance]"
            >
                {messages.map((msg, i) => (
                    <div
                        key={msg.id}
                        className={`break-inside-avoid mb-4 glass-card p-5 border transition-all duration-500 ${cardColors[i % cardColors.length]
                            }`}
                    >
                        <p className="font-sans text-cream/60 text-sm leading-relaxed italic">
                            &ldquo;{msg.message}&rdquo;
                        </p>
                        <p className="mt-3 text-xs text-amber/60 font-sans tracking-wider">
                            — {msg.name}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}
