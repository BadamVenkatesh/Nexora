import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const overlayRef = useRef(null);
    const cardRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            gsap.fromTo(
                overlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                cardRef.current,
                { scale: 0.9, opacity: 0, y: 30 },
                { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)', delay: 0.1 }
            );
        }
    }, [isOpen]);

    const handleClose = () => {
        gsap.to(cardRef.current, {
            scale: 0.9, opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
        });
        gsap.to(overlayRef.current, {
            opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onClose,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            onSuccess?.();
            handleClose();
        } catch (err) {
            const messages = {
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-email': 'Please enter a valid email.',
                'auth/invalid-credential': 'Invalid credentials. Please try again.',
            };
            setError(messages[err.code] || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            className="modal-overlay"
            onClick={(e) => e.target === overlayRef.current && handleClose()}
        >
            <div ref={cardRef} className="glass-card p-8 md:p-10 w-full max-w-md mx-4 relative">
                {/* Close button */}
                <button onClick={handleClose} className="absolute top-4 right-4 text-cream/30 hover:text-cream transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="font-serif text-2xl text-cream font-medium">Welcome Back</h2>
                    <p className="mt-2 text-cream/40 text-sm font-sans">
                        Sign in to manage Nexora
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="block text-xs text-cream/40 tracking-wider uppercase font-sans mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-cream/40 tracking-wider uppercase font-sans mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <p className="text-rose-light text-xs font-sans text-center py-2 px-3 rounded-lg bg-rose/10">
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary w-full mt-2 disabled:opacity-50">
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
