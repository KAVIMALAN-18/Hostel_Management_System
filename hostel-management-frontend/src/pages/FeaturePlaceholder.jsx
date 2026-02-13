/**
 * FeaturePlaceholder Component
 * Simplified placeholder for unfinished modules
 */
const FeaturePlaceholder = ({ title, subtitle }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 bg-white border border-slate-200 rounded shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mb-6 border border-blue-100 shadow-sm">
                ⚙️
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{title}</h1>
            <p className="text-slate-500 max-w-sm font-medium text-sm leading-relaxed">
                {subtitle || "This system module is currently under operational maintenance and will be available shortly."}
            </p>
            <div className="mt-8">
                <div className="px-5 py-2 bg-slate-900 text-white rounded text-[10px] font-bold tracking-widest uppercase border border-slate-800 shadow-sm">
                    System Implementation in progress
                </div>
            </div>
        </div>
    );
};

export default FeaturePlaceholder;
