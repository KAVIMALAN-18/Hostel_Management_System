import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AuthSplitShell from '../components/auth/AuthSplitShell';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'student',
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
        if (!formData.name.trim()) newErrors.name = 'Full name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email';
        }
        if (!formData.phone) {
            newErrors.phone = 'Phone is required';
        } else if (!/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = '10-digit phone required';
        }
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Min. 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            const result = await register(formData);
            if (result.success) {
                navigate(`/${result.user.role}/dashboard`);
            } else {
                setServerError(result.message || 'Registration request denied');
            }
        } catch (err) {
            setServerError('System connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthSplitShell
            wide
            heroEyebrow="Onboarding"
            heroTitle="Create your account"
            heroSubtitle="Register as a student, warden, or administrator. You will use this email to sign in to the hostel portal."
            bullets={[
                'One profile for room details and mess information',
                'Staff get tools for attendance and leave approvals',
                'Admins configure hostels, rooms, and directory data',
            ]}
            alternateHref="/login"
            alternateLabel="Already registered?"
            alternateCta="Sign in"
        >
            <div className="auth-form-surface-elevated">
                <div className="mb-8 border-b border-slate-100/90 pb-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Registration</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Your details</h2>
                    <p className="mt-2 text-sm text-slate-500">We validate fields when you submit.</p>
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Full name"
                            name="name"
                            placeholder="As on ID card"
                            value={formData.name}
                            onChange={handleChange}
                            error={errors.name}
                            autoComplete="name"
                        />
                        <Input
                            label="Phone"
                            name="phone"
                            placeholder="10-digit mobile"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            autoComplete="tel"
                        />
                    </div>

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

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="Min. 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            autoComplete="new-password"
                        />
                        <Input
                            label="Confirm password"
                            type="password"
                            name="confirmPassword"
                            placeholder="Repeat password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            autoComplete="new-password"
                        />
                    </div>

                    <div>
                        <span className="mb-2 block text-sm font-medium text-slate-700">Account type</span>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3" role="group" aria-label="Account type">
                            {['student', 'warden', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`rounded-xl border py-2.5 text-xs font-semibold capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:py-3 sm:text-sm ${formData.role === role
                                        ? 'border-brand-500 bg-brand-500 text-white shadow-md shadow-brand-500/25'
                                        : 'border-slate-200 bg-slate-50/80 text-slate-600 hover:border-brand-200 hover:bg-white'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="mt-2 w-full py-3 text-[15px] shadow-md shadow-brand-500/20"
                        loading={isLoading}
                    >
                        Create account
                    </Button>
                </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
                Hostel Management System · v2.1.0
            </p>
        </AuthSplitShell>
    );
};

export default Register;
