import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messAPI } from '../services/api';
import Modal from '../components/common/Modal';
import {
    CalendarIcon,
    ClockIcon,
    StarIcon,
    UsersIcon,
    EditIcon,
    SendIcon,
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CoffeeIcon,
    UtensilsIcon,
    CookieIcon,
    MoonIcon,
    ArrowUpRightIcon,
    XIcon,
    PlusIcon
} from '../components/common/Icons';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getWeekDates = () => {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday, 1 is Monday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });
};

const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
};

const MessManagement = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const isStudent = user?.role === 'student';

    const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
    const [allMenus, setAllMenus] = useState([]);
    const [overallRating, setOverallRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDay, setEditingDay] = useState(null);
    
    // Date & Cycle Logic
    const weekDates = useMemo(() => getWeekDates(), []);
    const mondayOfCurrentWeek = useMemo(() => getMondayOfCurrentWeek(), []);
    const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), []);
    const currentDayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

    // Feedback states
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Form states for editing
    const [formData, setFormData] = useState({
        breakfast: { items: '', time: '08:00 AM - 09:30 AM' },
        lunch: { items: '', time: '12:30 PM - 02:00 PM' },
        snacks: { items: '', time: '04:30 PM - 05:30 PM' },
        dinner: { items: '', time: '07:30 PM - 09:00 PM' }
    });

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await messAPI.getMenu();
            if (res.success) {
                setAllMenus(res.data);
                setOverallRating(res.overallRating || 0);
            }
        } catch (err) {
            console.error('Failed to fetch menu:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenu(); }, []);

    const currentMenu = useMemo(() => {
        const menu = allMenus.find(m => m.day === selectedDay);
        // "Start Fresh" Requirement: If menu was last updated before this week's Monday, it's stale.
        if (menu && new Date(menu.updatedAt) < mondayOfCurrentWeek) {
            return null;
        }
        return menu || null;
    }, [allMenus, selectedDay, mondayOfCurrentWeek]);

    const handleEditClick = () => {
        const existing = allMenus.find(m => m.day === selectedDay);
        // Pre-fill only if it's NOT stale, or empty if starting fresh
        const isStale = existing && new Date(existing.updatedAt) < mondayOfCurrentWeek;
        
        if (existing && !isStale) {
            setFormData({
                breakfast: { items: existing.breakfast.items.join(', '), time: existing.breakfast.time },
                lunch: { items: existing.lunch.items.join(', '), time: existing.lunch.time },
                snacks: { items: existing.snacks.items.join(', '), time: existing.snacks.time },
                dinner: { items: existing.dinner.items.join(', '), time: existing.dinner.time }
            });
        } else {
            setFormData({
                breakfast: { items: '', time: '08:00 AM - 09:30 AM' },
                lunch: { items: '', time: '12:30 PM - 02:00 PM' },
                snacks: { items: '', time: '04:30 PM - 05:30 PM' },
                dinner: { items: '', time: '07:30 PM - 09:00 PM' }
            });
        }
        setEditingDay(selectedDay);
        setIsEditModalOpen(true);
    };

    const handleUpdateMenu = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                breakfast: { items: formData.breakfast.items.split(',').map(i => i.trim()).filter(i => i), time: formData.breakfast.time },
                lunch: { items: formData.lunch.items.split(',').map(i => i.trim()).filter(i => i), time: formData.lunch.time },
                snacks: { items: formData.snacks.items.split(',').map(i => i.trim()).filter(i => i), time: formData.snacks.time },
                dinner: { items: formData.dinner.items.split(',').map(i => i.trim()).filter(i => i), time: formData.dinner.time }
            };
            const res = await messAPI.updateMenu(editingDay, payload);
            if (res.success) {
                setIsEditModalOpen(false);
                fetchMenu();
            }
        } catch (err) {
            console.error('Menu update error:', err);
            alert('Failed to update menu');
        }
    };

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await messAPI.submitFeedback({
                day: selectedDay,
                rating,
                comment
            });
            if (res.success) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setRating(0);
                    setComment('');
                }, 3000);
            }
        } catch (err) {
            console.error('Feedback error:', err);
            alert('Feedback submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const mealIcons = {
        Breakfast: <CoffeeIcon className="w-6 h-6" />,
        Lunch: <UtensilsIcon className="w-6 h-6" />,
        Snacks: <CookieIcon className="w-6 h-6" />,
        Dinner: <MoonIcon className="w-6 h-6" />
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Mess Management</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2 flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-brand-600" />
                        Today: <span className="text-brand-600 dark:text-brand-400 font-bold">{todayStr}</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <button 
                            onClick={handleEditClick}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-500/20"
                        >
                            <EditIcon className="w-4 h-4" />
                            Update Daily Menu
                        </button>
                    )}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Kitchen Active</span>
                    </div>
                </div>
            </div>

            {/* Day Selector */}
            <div className="bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2 overflow-x-auto">
                {DAYS.map((day, idx) => {
                    const dateObj = weekDates[idx];
                    const isToday = idx === currentDayIdx;
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-6 py-3 rounded-xl text-xs font-bold transition-all flex-1 min-w-[140px]
                                ${selectedDay === day 
                                    ? 'bg-slate-900 text-white shadow-xl scale-105 z-10' 
                                    : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
                                ${isToday && selectedDay !== day ? 'ring-2 ring-brand-500/50' : ''}
                            `}
                        >
                            <div className="flex flex-col items-center gap-1">
                                {isToday && <span className="text-[8px] text-brand-500 font-black tracking-widest leading-none mb-0.5 animate-pulse">⭐ TODAY</span>}
                                <span>{day}</span>
                                <span className={`text-[10px] ${selectedDay === day ? 'text-white/60' : 'text-slate-400 font-medium'}`}>
                                    {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Menu Display */}
                <div className="lg:col-span-12 space-y-4">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1,2,3,4].map(i => <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] animate-pulse"></div>)}
                        </div>
                    ) : !currentMenu ? (
                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                            <UtensilsIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No menu scheduled for {selectedDay}.</p>
                            {isAdmin && (
                                <button 
                                    onClick={handleEditClick}
                                    className="mt-4 text-brand-600 font-bold text-sm uppercase tracking-wider hover:underline"
                                >
                                    + Create Schedule
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => (
                                <div key={meal} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden relative">
                                    <div className="flex flex-col gap-4">
                                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                            {mealIcons[meal]}
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{meal}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <ClockIcon className="w-3 h-3 text-brand-600" />
                                                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{currentMenu[meal.toLowerCase()]?.time}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {currentMenu[meal.toLowerCase()]?.items.map((item, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-tight group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                                                        {item}
                                                    </span>
                                                )) || <span className="text-xs font-bold text-slate-300 uppercase italic">No items</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Overall Community Rating */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-8 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-500/30 transition-all duration-500">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/10 rounded-2xl flex items-center justify-center text-brand-600">
                        <UsersIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Community Satisfaction Index</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5 italic">Real-time aggregate of all valid resident signals.</p>
                    </div>
                </div>
                <div className="bg-brand-600 dark:bg-brand-500/20 dark:border dark:border-brand-500/30 rounded-2xl px-10 py-4 text-white flex items-center gap-4 shadow-xl shadow-brand-500/10 transition-all">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Overall</span>
                        <div className="flex items-center gap-2">
                            <StarIcon className="w-6 h-6 text-amber-400 fill-amber-400" />
                            <span className="text-4xl font-black">{overallRating.toFixed(1)}</span>
                            <span className="text-xs font-bold opacity-40 mt-3">/ 10</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resident Feedback System */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/20 dark:bg-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Feedback</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-1">Provide feedback for the culinary services on {selectedDay}.</p>
                    </div>
                </div>

                <div className={`p-10 ${!isStudent && 'opacity-50 pointer-events-none grayscale'}`}>
                     {!isStudent && <div className="mb-4 text-xs font-bold text-amber-600 uppercase">Warden/Admin: Read-only feedback view</div>}
                     <form onSubmit={handleSubmitFeedback} className="space-y-10">
                         <div className="space-y-4">
                             <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-400 uppercase tracking-wide">
                                 Rating (1-10)
                                 {rating > 0 && <span className="text-brand-600 font-bold">Selected: {rating} / 10</span>}
                             </div>
                             <div className="flex gap-2">
                                 {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                     <button 
                                        key={i} 
                                        type="button" 
                                        onClick={() => setRating(i)}
                                        className={`flex-1 h-12 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center
                                            ${rating === i ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-lg z-10' : 'bg-white text-slate-400 border-slate-50 hover:border-brand-100'}
                                        `}
                                     >
                                         {i}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2">Comment</label>
                             <textarea 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Tell us what you think..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-2xl p-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all min-h-[100px] resize-none"
                             />
                         </div>

                         <div className="flex justify-end pt-4 border-t border-slate-50 dark:border-slate-700">
                             <button 
                                type="submit"
                                disabled={rating === 0 || submitting || submitted}
                                className={`px-10 py-4 rounded-xl text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 flex items-center gap-2
                                    ${submitted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:shadow-xl shadow-brand-soft'}
                                    ${(rating === 0 && !submitted) ? 'opacity-30' : ''}
                                `}
                             >
                                 {submitted ? 'Submitted Success' : submitting ? 'Submitting...' : (
                                     <>
                                         <SendIcon className="w-4 h-4" />
                                         Submit Feedback
                                     </>
                                 )}
                             </button>
                         </div>
                     </form>
                </div>
            </div>

            {/* Admin Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Configure Menu: ${editingDay}`}
                subtitle="Update the nutritional deployment schedule for this day."
            >
                <form onSubmit={handleUpdateMenu} className="space-y-6">
                    {['breakfast', 'lunch', 'snacks', 'dinner'].map(meal => (
                        <div key={meal} className="space-y-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                {mealIcons[meal.charAt(0).toUpperCase() + meal.slice(1)]}
                                {meal}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Items (comma separated)</label>
                                    <input 
                                        type="text"
                                        value={formData[meal].items}
                                        onChange={e => setFormData({ ...formData, [meal]: { ...formData[meal], items: e.target.value } })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
                                        placeholder="Poha, Tea, Fruit"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Time Slot</label>
                                    <input 
                                        type="text"
                                        value={formData[meal].time}
                                        onChange={e => setFormData({ ...formData, [meal]: { ...formData[meal], time: e.target.value } })}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={() => setIsEditModalOpen(false)}
                            className="px-6 py-3 rounded-xl text-xs font-bold uppercase text-slate-400 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold uppercase transition-all shadow-lg shadow-brand-500/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MessManagement;
