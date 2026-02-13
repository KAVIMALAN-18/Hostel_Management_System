import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

/**
 * Unauthorized Component
 * Displayed when an authenticated user tries to access a route they don't have permission for
 */
const Unauthorized = () => {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto shadow-inner transform rotate-3">
                        <span className="text-4xl">🚫</span>
                    </div>
                </div>

                <Card className="border-none shadow-2xl shadow-slate-200/50 p-8">
                    <h1 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tight italic">Access Restricted</h1>
                    <p className="text-sm text-slate-500 mb-8 leading-relaxed font-medium uppercase tracking-tight italic">
                        Your current authentication tier does not permit access to this encrypted sector.
                    </p>

                    <Link to="/">
                        <Button className="w-full py-3 text-xs tracking-[0.2em] font-black uppercase italic">
                            Back to Safe Zone
                        </Button>
                    </Link>
                </Card>

                <p className="mt-10 text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] opacity-50">
                    ERR_INT_403_RESTRICTED_PROTOCOL
                </p>
            </div>
        </div>
    );
};

export default Unauthorized;
