import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
        setServerError('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email address';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError('');
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const result = await login(formData);
            if (result.success) {
                const dashboardRoute = `/${result.user.role}/dashboard`;
                navigate(dashboardRoute);
            } else {
                setServerError(result.message || 'Invalid credentials provided');
            }
        } catch (err) {
            setServerError('System connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div className="bg-slate-900 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded mb-3">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                        <h1 className="text-white text-lg font-bold uppercase tracking-widest">Portal Access</h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-1">Hostel Management Operations</p>
                    </div>

                    <div className="p-8">
                        {serverError && (
                            <div className="mb-6 p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-[11px] font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                label="Authorized Email"
                                type="email"
                                name="email"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                autoComplete="email"
                            />

                            <Input
                                label="System Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                autoComplete="current-password"
                            />

                            <div className="flex items-center justify-between pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Keep Session</span>
                                </label>
                                <a href="#" className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tight">Recovery</a>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-2.5 mt-4"
                                loading={isLoading}
                            >
                                Authenticate
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Unregistered Resident?
                            </p>
                            <Link
                                to="/register"
                                className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline uppercase"
                            >
                                Apply for Access
                            </Link>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] opacity-60">
                    Hostel Management System v2.1.0 • 2026
                </p>
            </div>
        </div>
    );
};

export default Login;
