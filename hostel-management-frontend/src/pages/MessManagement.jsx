import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    CalendarIcon,
    ClockIcon,
    CheckIcon,
    StarIcon,
    UsersIcon,
    EditIcon
} from '../components/common/Icons';

/**
 * MessManagement Component
 * Comprehensive module for menu viewing, historical navigation, and feedback.
 */
const MessManagement = () => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    // Dates & Navigation
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Feedback States
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitted, setSubmitted] = useState(false);

    // Mock Feedback Data
    const [feedbackStats, setFeedbackStats] = useState({
        score: '8.4',
        count: '132'
    });

    const recentFeedbacks = [
        { rating: 9 },
        { rating: 8 },
        { rating: 10 }
    ];

    // Menu Data based on selected date and updated timings
    const menuData = useMemo(() => {
        const timings = {
            breakfast: '7:00 AM – 8:30 AM',
            lunch: '12:20 PM – 1:30 PM',
            snacks: '4:30 PM – 5:30 PM',
            dinner: '7:00 PM – 8:30 PM'
        };

        const menus = {
            'default': [
                { meal: 'Breakfast', time: timings.breakfast, items: ['Idli', 'Sambar', 'Coconut Chutney', 'Filter Coffee'] },
                { meal: 'Lunch', time: timings.lunch, items: ['Rice', 'Sambar', 'Rasam', 'Poriyal', 'Curd'] },
                { meal: 'Evening Snacks', time: timings.snacks, items: ['Vada / Sundal', 'Tea'] },
                { meal: 'Dinner', time: timings.dinner, items: ['Chapati / Dosa', 'Kurma', 'Milk'] }
            ],
            'alternate': [
                { meal: 'Breakfast', time: timings.breakfast, items: ['Pongal', 'Medhu Vada', 'Gotsu', 'Tea / Coffee'] },
                { meal: 'Lunch', time: timings.lunch, items: ['Variety Rice', 'Potato Fry', 'Curd Rice', 'Pickle'] },
                { meal: 'Evening Snacks', time: timings.snacks, items: ['Onion Pakoda', 'Tea'] },
                { meal: 'Dinner', time: timings.dinner, items: ['Dosa', 'Tomato Thokku', 'Milk'] }
            ]
        };
        return selectedDate.getDate() % 2 === 0 ? menus.alternate : menus.default;
    }, [selectedDate]);

    // Calendar Grid Logic
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

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleSubmitFeedback = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // Simulate visual update
        setFeedbackStats(prev => ({
            ...prev,
            count: (parseInt(prev.count) + 1).toString()
        }));

        setTimeout(() => {
            setRating(0);
            setComment('');
            setSubmitted(false);
        }, 4000);
    };

    const isToday = (date) => {
        const today = new Date();
        return date && date.toDateString() === today.toDateString();
    };

    const isSelected = (date) => {
        return date && date.toDateString() === selectedDate.toDateString();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Mess Management</h1>
                    <p className="text-slate-500 font-medium">Daily & Monthly Meal Schedule</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                        Daily mess menu updated every night
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lateral Panel: Month & Calendar Selection */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Month</span>
                            <select
                                value={currentMonth.getMonth()}
                                onChange={(e) => setCurrentMonth(new Date(currentMonth.getFullYear(), parseInt(e.target.value), 1))}
                                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none"
                            >
                                {months.map((m, idx) => (
                                    <option key={idx} value={idx}>{m} {currentMonth.getFullYear()}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-slate-300 py-2">{d}</div>
                            ))}
                            {calendarDays.map((date, idx) => (
                                <button
                                    key={idx}
                                    disabled={!date}
                                    onClick={() => date && setSelectedDate(date)}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all
                                        ${!date ? 'invisible pointer-events-none' : 'hover:bg-slate-50'}
                                        ${isToday(date) ? 'text-brand-600 ring-2 ring-inset ring-brand-100' : 'text-slate-500'}
                                        ${isSelected(date) ? 'bg-brand-600 !text-white shadow-soft ring-0' : ''}
                                    `}
                                >
                                    {date?.getDate()}
                                </button>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-brand-50 rounded-lg"><CalendarIcon className="w-4 h-4 text-brand-600" /></div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Selected Date</p>
                                    <p className="text-sm font-black text-slate-800">
                                        {selectedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content: Daily Menu View */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {menuData.map((item, idx) => (
                            <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col group">
                                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/20 group-hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{item.meal}</h3>
                                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm border border-blue-100/50">
                                            {item.time}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow">
                                    <ul className="space-y-3">
                                        {item.items.map((food, fIdx) => (
                                            <li key={fIdx} className="flex items-center gap-3 group/item">
                                                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full group-hover/item:bg-brand-500 transition-colors"></div>
                                                <span className="text-sm font-semibold text-slate-600 group-hover/item:text-slate-900 transition-colors">
                                                    {food}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="h-1 bg-slate-100/30 w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Redesigned Full-Width Feedback Section */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Section Header & Summary Row */}
                <div className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/10">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Rate Today's Menu</h3>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Your feedback helps us maintain the highest dining standards.</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                                <StarIcon className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Rating</p>
                                <p className="text-lg font-black text-slate-900">{feedbackStats.score}<span className="text-xs font-bold text-slate-400 ml-0.5">/10</span></p>
                            </div>
                        </div>
                        <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <UsersIcon className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Responses</p>
                                <p className="text-lg font-black text-slate-900">{feedbackStats.count}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Student Input Form (Full Width) */}
                <div className={`p-8 ${!isStudent && 'opacity-50 pointer-events-none'}`}>
                    {submitted && (
                        <div className="mb-8 flex items-center gap-3 bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-sm">
                                <CheckIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-bold tracking-tight">Thank you! Your feedback for {selectedDate.toLocaleDateString()} has been recorded.</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmitFeedback} className="space-y-10">
                        {/* Row 1: Rating Selection */}
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 leading-none">Overall Satisfaction</label>
                                {rating > 0 && (
                                    <span className="text-brand-600 font-black text-xs uppercase tracking-wider">Your rating: {rating}/10</span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 max-w-4xl">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                    <button
                                        key={n}
                                        type="button"
                                        onClick={() => setRating(n)}
                                        className={`
                                            flex-1 min-w-[44px] h-14 rounded-2xl flex items-center justify-center text-sm font-black transition-all border-2
                                            ${rating === n
                                                ? 'bg-brand-600 text-white border-brand-600 shadow-brand transform scale-110 z-10'
                                                : 'bg-white text-slate-500 border-slate-100 hover:border-brand-200 hover:bg-brand-50/30'}
                                        `}
                                    >
                                        {n}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold italic px-1">Rate today’s meals from 1 (Poor) to 10 (Excellent)</p>
                        </div>

                        {/* Row 2: Comment Textarea */}
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block px-1 leading-none">Detailed Experience (Optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us what you liked or how we can improve today's food quality..."
                                className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl p-6 text-sm font-medium focus:bg-white focus:border-brand-500 outline-none transition-all placeholder:text-slate-300 resize-none h-32"
                            ></textarea>
                        </div>

                        {/* Row 3: Submit Button & Environmental Note Overlay */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-2">
                            <div className="flex items-center gap-3 px-5 py-3 bg-blue-50/50 rounded-2xl border border-blue-100/50 max-w-md">
                                <span className="text-xl">🌍</span>
                                <p className="text-[11px] font-bold text-blue-700 leading-tight">
                                    Eco Initiative: <span className="font-black">Don't waste food.</span> Sustainability starts with mindful consumption.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={rating === 0 || submitted}
                                className={`
                                            px-8 py-7 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all transform active:scale-[0.98] shadow-brand-soft
                                            ${submitted
                                        ? 'bg-emerald-50 text-emerald-300 border border-emerald-100 grayscale cursor-not-allowed'
                                        : 'bg-brand-600 hover:bg-brand-700 text-white hover:shadow-2xl hover:-translate-y-1 focus:ring-8 focus:ring-brand-500/10'}
                                        `}
                            >
                                {submitted ? 'Feedback Received' : 'Submit My Feedback'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default MessManagement;
