import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
                    <div className="bg-slate-900 p-6 text-center">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded mb-3">
                            <span className="text-white font-bold text-xl">H</span>
                        </div>
                        <h1 className="text-white text-lg font-bold uppercase tracking-widest">Resident Registration</h1>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tight mt-1">Enrollment for Management System</p>
                    </div>

                    <div className="p-8">
                        {serverError && (
                            <div className="mb-6 p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-[11px] font-bold flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-4 border-b border-slate-100 pb-1">Personal Protocols</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    error={errors.name}
                                />
                                <Input
                                    label="Contact Number"
                                    name="phone"
                                    placeholder="10-digit mobile"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    error={errors.phone}
                                />
                            </div>

                            <Input
                                label="Academic Email Address"
                                type="email"
                                name="email"
                                placeholder="name@university.edu"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Secure Password"
                                    type="password"
                                    name="password"
                                    placeholder="Min. 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Retype password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    error={errors.confirmPassword}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 pt-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Account Classification</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['student', 'warden', 'admin'].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role })}
                                            className={`py-2 rounded text-[10px] font-bold uppercase tracking-tight border transition-all ${formData.role === role
                                                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                                : 'bg-white text-slate-400 border-slate-200 hover:border-blue-400'
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
                                className="w-full py-2.5 mt-6"
                                loading={isLoading}
                            >
                                Finalize Registration
                            </Button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Existing Account?
                            </p>
                            <Link
                                to="/login"
                                className="inline-block mt-2 text-xs font-bold text-blue-600 hover:underline uppercase"
                            >
                                Secure Login →
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

export default Register;
