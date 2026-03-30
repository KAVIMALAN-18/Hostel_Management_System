import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AuthSplitShell from '../components/auth/AuthSplitShell';

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
        } else {
            const email = formData.email.toLowerCase();
            const isValidDomain = email === 'admin@hostel.ac.in' || 
                                 email.endsWith('@warden.ac.in') || 
                                 email.endsWith('@student.ac.in');
            if (!/\S+@\S+\.\S+/.test(email)) {
                newErrors.email = 'Invalid email address';
            } else if (!isValidDomain) {
                newErrors.email = 'Use @hostel.ac.in, @warden.ac.in, or @student.ac.in';
            }
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
        <AuthSplitShell
            heroEyebrow="Secure portal"
            heroTitle="Welcome back"
            heroSubtitle="Sign in to manage rooms, attendance, leave, mess, and notices — all in one place for your hostel."
            bullets={[
                'Role-based access for students, wardens, and admins',
                'Leave requests and attendance in a single workflow',
                'Built for day-to-day hostel operations',
            ]}
            alternateHref="/register"
            alternateLabel="New to the system?"
            alternateCta="Create an account"
        >
            <div className="auth-form-surface-elevated">
                <div className="mb-8 border-b border-slate-200/90 dark:border-slate-700/50 pb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Sign in</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access your dashboard</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">Use your institutional email and password.</p>
                </div>

                {serverError && (
                    <div
                        className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-200/90 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-800"
                        role="alert"
                    >
                        <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-hidden />
                        {serverError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="you@university.edu"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        autoComplete="email"
                    />

                    <Input
                        label="Password"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        error={errors.password}
                        autoComplete="current-password"
                    />

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                        <label className="flex cursor-pointer select-none items-center gap-2.5">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-slate-600">Remember me</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="mt-2 w-full py-3 text-[15px] shadow-md shadow-brand-500/20"
                        loading={isLoading}
                    >
                        Sign in
                    </Button>
                </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
                Hostel Management System · v2.1.0
            </p>
        </AuthSplitShell>
    );
};

export default Login;
