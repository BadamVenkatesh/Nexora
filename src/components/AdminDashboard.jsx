import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const TABS = [
    { key: 'events', label: 'Events', icon: '📸' },
    { key: 'timeline', label: 'Timeline', icon: '🕐' },
    { key: 'highlights', label: 'Highlights', icon: '✦' },
    { key: 'schedule', label: 'Schedule', icon: '📅' },
];

function AdminSection({ title, subtitle, children }) {
    return (
        <div className="mb-10">
            <h2 className="font-serif text-xl text-cream mb-1">{title}</h2>
            <p className="text-cream/30 text-xs font-sans mb-6">{subtitle}</p>
            {children}
        </div>
    );
}

function ItemRow({ item, onEdit, onDelete, label }) {
    return (
        <div className="glass-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
                <h3 className="font-serif text-sm text-cream font-medium truncate">{item.title || item.name}</h3>
                <p className="text-cream/30 text-xs font-sans mt-0.5 truncate">{item.description || item.quote || ''}</p>
            </div>
            {label && <span className="text-[10px] text-amber/50 tracking-wider uppercase font-sans flex-shrink-0">{label}</span>}
            <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => onEdit(item)} className="text-xs text-amber/60 hover:text-amber transition-colors font-sans px-3 py-1.5 border border-amber/20 rounded-lg">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-xs text-rose/60 hover:text-rose-light transition-colors font-sans px-3 py-1.5 border border-rose/20 rounded-lg">Delete</button>
            </div>
        </div>
    );
}

export default function AdminDashboard({ onClose }) {
    const [activeTab, setActiveTab] = useState('events');
    const [items, setItems] = useState({ events: [], timeline: [], highlights: [], schedule: [] });
    const [form, setForm] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const panelRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(panelRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }, []);

    // Listen to all collections
    useEffect(() => {
        const unsubs = [];
        const collections = {
            events: query(collection(db, 'events'), orderBy('createdAt', 'desc')),
            timeline: query(collection(db, 'timeline'), orderBy('order', 'asc')),
            highlights: query(collection(db, 'highlights'), orderBy('createdAt', 'desc')),
            schedule: query(collection(db, 'schedule'), orderBy('order', 'asc')),
        };

        Object.entries(collections).forEach(([key, q]) => {
            try {
                const unsub = onSnapshot(q, (snap) => {
                    setItems(prev => ({ ...prev, [key]: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
                }, () => { });
                unsubs.push(unsub);
            } catch { }
        });

        return () => unsubs.forEach(u => u());
    }, []);

    const resetForm = () => { setForm({}); setEditingId(null); setMessage(''); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const col = activeTab;
            const data = { ...form };

            // Add order for timeline and schedule
            if ((col === 'timeline' || col === 'schedule') && !editingId) {
                data.order = items[col].length;
            }

            if (editingId) {
                await updateDoc(doc(db, col, editingId), { ...data, updatedAt: serverTimestamp() });
                setMessage('✓ Updated successfully');
            } else {
                await addDoc(collection(db, col), { ...data, createdAt: serverTimestamp() });
                setMessage('✓ Created successfully');
            }
            resetForm();
        } catch (err) {
            setMessage('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        const { id, createdAt, updatedAt, ...rest } = item;
        setForm(rest);
        setEditingId(id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this item?')) return;
        try {
            await deleteDoc(doc(db, activeTab, id));
            setMessage('✓ Deleted');
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    const formFields = {
        events: [
            { key: 'name', label: 'Event Name', type: 'text', placeholder: 'Farewell Night', required: true },
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'A brief description...', required: true },
            { key: 'driveLink', label: 'Google Drive Link', type: 'url', placeholder: 'https://drive.google.com/...' },
            { key: 'imageUrl', label: 'Image URL', type: 'url', placeholder: 'https://...' },
        ],
        timeline: [
            { key: 'tag', label: 'Tag / Label', type: 'text', placeholder: 'Pre-Events Day 1', required: true },
            { key: 'title', label: 'Title', type: 'text', placeholder: 'The Grand Preparation', required: true },
            { key: 'description', label: 'Description', type: 'textarea', placeholder: 'What happened this day...', required: true },
            { key: 'order', label: 'Order (0, 1, 2...)', type: 'number', placeholder: '0' },
        ],
        highlights: [
            { key: 'title', label: 'Highlight Title', type: 'text', placeholder: 'Day 1 Highlights', required: true },
            { key: 'quote', label: 'Quote / Caption', type: 'textarea', placeholder: 'The day we started an unforgettable journey...' },
            { key: 'author', label: 'Author', type: 'text', placeholder: '— Admin' },
            { key: 'badge', label: 'Badge Text', type: 'text', placeholder: "✦ Today's Highlight" },
            { key: 'imageUrl', label: 'Background Image URL', type: 'url', placeholder: 'https://...' },
        ],
        schedule: [
            { key: 'date', label: 'Date', type: 'text', placeholder: 'April 9', required: true },
            { key: 'title', label: 'Event Title', type: 'text', placeholder: 'Pre-Events Day 1', required: true },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'Decoration setup & rehearsals' },
            { key: 'time', label: 'Time', type: 'text', placeholder: '10:00 AM - 5:00 PM' },
            { key: 'status', label: 'Status', type: 'select', options: ['upcoming', 'highlight', 'completed'] },
            { key: 'order', label: 'Order (0, 1, 2...)', type: 'number', placeholder: '0' },
        ],
    };

    const getItemLabel = (item) => {
        if (activeTab === 'highlights' && item.createdAt?.seconds) {
            const hrs = Math.floor((Date.now() - item.createdAt.seconds * 1000) / (1000 * 60 * 60));
            return hrs < 24 ? `${24 - hrs}h remaining` : 'Expired';
        }
        if (activeTab === 'schedule') return item.time || '';
        if (activeTab === 'timeline') return item.tag || '';
        return '';
    };

    return (
        <div className="fixed inset-0 z-[200] bg-charcoal/95 overflow-y-auto">
            <div ref={panelRef} className="max-w-5xl mx-auto py-20 px-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-serif text-3xl text-cream font-medium">Admin Dashboard</h1>
                        <p className="mt-1 text-cream/40 text-sm font-sans">Manage all content on Nexora</p>
                    </div>
                    <button onClick={onClose} className="btn-secondary text-xs py-2 px-5">← Back to Site</button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-2">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); resetForm(); }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans tracking-wider uppercase transition-all duration-300 flex-shrink-0 ${activeTab === tab.key
                                    ? 'bg-amber/15 text-amber border border-amber/20'
                                    : 'text-cream/40 hover:text-cream/60 border border-transparent hover:border-cream/10'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                            <span className="text-cream/20 ml-1">({items[tab.key].length})</span>
                        </button>
                    ))}
                </div>

                {/* Form */}
                <div className="glass-card p-6 md:p-8 mb-8">
                    <h3 className="font-serif text-lg text-cream mb-5">
                        {editingId ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}
                    </h3>

                    {activeTab === 'highlights' && !editingId && (
                        <div className="mb-5 px-4 py-3 rounded-lg bg-amber/5 border border-amber/10">
                            <p className="text-xs text-amber/70 font-sans">
                                ⏱ Highlights auto-expire after 24 hours from creation
                            </p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {formFields[activeTab].map(field => (
                            <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                <label className="block text-xs text-cream/40 tracking-wider uppercase font-sans mb-2">
                                    {field.label}
                                </label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        className="input-field min-h-[80px] resize-none"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        value={form[field.key] || field.options[0]}
                                        onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                                        className="input-field"
                                    >
                                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        value={form[field.key] || ''}
                                        onChange={(e) => setForm({ ...form, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                                        className="input-field"
                                        placeholder={field.placeholder}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                        <div className="md:col-span-2 flex gap-3">
                            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
                                {loading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                            )}
                        </div>
                    </form>
                    {message && <p className="mt-4 text-sm text-amber/80 font-sans">{message}</p>}
                </div>

                {/* Items List */}
                <AdminSection
                    title={`${TABS.find(t => t.key === activeTab)?.label} (${items[activeTab].length})`}
                    subtitle={activeTab === 'highlights' ? 'Items auto-expire 24h after creation' : 'Manage existing items'}
                >
                    {items[activeTab].length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <p className="text-cream/30 font-sans text-sm">No items yet. Create one above.</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {items[activeTab].map(item => (
                                <ItemRow
                                    key={item.id}
                                    item={item}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    label={getItemLabel(item)}
                                />
                            ))}
                        </div>
                    )}
                </AdminSection>
            </div>
        </div>
    );
}
