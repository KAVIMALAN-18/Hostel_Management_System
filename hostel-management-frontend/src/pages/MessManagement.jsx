import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messAPI } from '../services/api';
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
    XIcon
} from '../components/common/Icons';

const MessManagement = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const fetchMenu = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await messAPI.getMenu(dateStr);
            if (res.success) {
                setMenu(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch menu:', err);
            setMenu(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchMenu(); }, [selectedDate]);

    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const res = await messAPI.submitFeedback({
                date: dateStr,
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
            alert('Feedback submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= totalDays; i++) days.push(new Date(year, month, i));
        return days;
    }, [currentMonth]);

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
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Culinary Console</h1>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-2">Executive oversight of nutritional deployment and resident dining satisfaction.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Kitchen Active</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Calendar Panel */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-soft">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Dining Ledger</h3>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                    <ChevronLeftIcon className="w-4 h-4 text-slate-400" />
                                </button>
                                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                                    {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                                    <ChevronRightIcon className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-8 text-center text-xs font-bold text-slate-300 uppercase tracking-wider">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="h-8 flex items-center justify-center">{d}</div>)}
                            {calendarDays.map((date, idx) => (
                                <button
                                    key={idx}
                                    disabled={!date}
                                    onClick={() => date && setSelectedDate(date)}
                                    className={`
                                        aspect-square rounded-2xl text-sm font-bold transition-all flex items-center justify-center
                                        ${!date ? 'invisible' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}
                                        ${date?.toDateString() === selectedDate.toDateString() ? 'bg-brand-600 !text-white shadow-lg shadow-brand-500/20' : 'text-slate-500'}
                                        ${date?.toDateString() === new Date().toDateString() ? 'ring-2 ring-brand-100 dark:ring-brand-900/40 text-brand-600' : ''}
                                    `}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
                             <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 shadow-sm shadow-brand-500/10">
                                       <CalendarIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                       <p className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">Active Window</p>
                                       <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{selectedDate.toLocaleDateString([], { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                  </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Menu Display */}
                <div className="lg:col-span-8 space-y-4">
                    {loading ? (
                        [1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 rounded-[2rem] animate-pulse"></div>)
                    ) : !menu ? (
                        <div className="py-20 text-center bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-700 rounded-[2.5rem]">
                            <UtensilsIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Menu Pending. Culinary team preparing schedule.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['Breakfast', 'Lunch', 'Snacks', 'Dinner'].map((meal) => (
                                <div key={meal} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[2.5rem] p-6 pr-8 shadow-soft hover:shadow-premium transition-all duration-500 overflow-hidden relative">
                                    <div className="flex items-start gap-5">
                                        <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all duration-500">
                                            {mealIcons[meal]}
                                        </div>
                                        <div className="pt-1 flex-1">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{meal}</h3>
                                                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">{menu[meal.toLowerCase()]?.time}</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {menu[meal.toLowerCase()]?.items.map((item, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-tight group-hover:bg-white dark:group-hover:bg-slate-900 transition-colors">
                                                        {item}
                                                    </span>
                                                )) || <span className="text-xs font-bold text-slate-300 uppercase italic">No items scheduled</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRightIcon className="w-4 h-4 text-slate-200" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Feedback System */}
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-700 shadow-premium overflow-hidden transition-all duration-700">
                <div className="p-10 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between bg-slate-50/20 dark:bg-white/5">
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Resident Feedback</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-300 mt-1">Real-time performance analytics for today's culinary deployment.</p>
                    </div>
                    <div className="flex items-center gap-3">
                         <div className="text-right">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Service Rating</p>
                              <p className="text-xl font-bold text-slate-900 dark:text-white tracking-tight tabular-nums">8.4 / 10</p>
                         </div>
                    </div>
                </div>

                <div className={`p-10 ${!isStudent && 'opacity-50 pointer-events-none grayscale'}`}>
                     <form onSubmit={handleSubmitFeedback} className="space-y-12">
                         <div className="space-y-6">
                             <div className="flex items-center justify-between px-2">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Satisfaction Index</span>
                                 {rating > 0 && <span className="text-xs font-bold text-brand-600 uppercase">Selected: {rating} / 10</span>}
                             </div>
                             <div className="flex gap-2.5">
                                 {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                     <button 
                                        key={i} 
                                        type="button" 
                                        onClick={() => setRating(i)}
                                        className={`flex-1 h-16 rounded-[1.5rem] text-sm font-bold transition-all border-2 flex items-center justify-center
                                            ${rating === i ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-xl z-10' : 'bg-white text-slate-400 border-slate-50 hover:border-brand-100'}
                                        `}
                                     >
                                         {i}
                                     </button>
                                 ))}
                             </div>
                         </div>

                         <div className="space-y-4">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-2">Diagnostic Notes</label>
                             <textarea 
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Disclose specific details regarding texture, flavor, or delivery speed..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-50 dark:border-slate-700 rounded-[2rem] p-8 text-sm font-medium text-slate-900 dark:text-white outline-none focus:border-brand-500 transition-all min-h-[160px] resize-none"
                             />
                         </div>

                         <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-700">
                             <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/40">
                                  <CheckIcon className="w-5 h-5 text-emerald-500" />
                                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider leading-tight">Anonymous submission protocol enabled</p>
                             </div>
                             
                             <button 
                                type="submit"
                                disabled={rating === 0 || submitting || submitted}
                                className={`px-12 py-5 rounded-[2rem] text-xs font-bold uppercase tracking-wide transition-all transform active:scale-95 flex items-center gap-4
                                    ${submitted ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:shadow-2xl hover:-translate-y-1 shadow-brand-soft'}
                                    ${(rating === 0 && !submitted) ? 'opacity-30' : ''}
                                `}
                             >
                                 {submitted ? 'DISPATCH SUCCESS' : submitting ? 'COMMUNICATING...' : (
                                     <>
                                         <SendIcon className="w-4 h-4" />
                                         DISPATCH FEEDBACK
                                     </>
                                 )}
                             </button>
                         </div>
                     </form>
                </div>
            </div>
        </div>
    );
};

export default MessManagement;
