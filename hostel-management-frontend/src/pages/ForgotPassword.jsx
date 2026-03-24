import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import AuthSplitShell from '../components/auth/AuthSplitShell';

/**
 * Password reset: OTP sent to registered phone (lookup by phone or email).
 */
const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [method, setMethod] = useState('phone');
    const [identifier, setIdentifier] = useState('');
    const [maskedPhone, setMaskedPhone] = useState('');
    const [devOtp, setDevOtp] = useState(null);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [done, setDone] = useState(false);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        const trimmed = identifier.trim();
        if (!trimmed) {
            setError(method === 'email' ? 'Enter your email' : 'Enter your 10-digit mobile number');
            return;
        }
        if (method === 'phone' && trimmed.replace(/\D/g, '').length !== 10) {
            setError('Enter a valid 10-digit mobile number');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.sendForgotPasswordOtp(trimmed);
            if (res.success) {
                setMaskedPhone(res.maskedPhone || '');
                setDevOtp(res.devOtp ?? null);
                setIdentifier(trimmed);
                setStep(2);
            }
        } catch (err) {
            setError(err.message || 'Could not send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError('');
        setResendLoading(true);
        try {
            const res = await authAPI.sendForgotPasswordOtp(identifier.trim());
            if (res.success) {
                setMaskedPhone(res.maskedPhone || '');
                setDevOtp(res.devOtp ?? null);
            }
        } catch (err) {
            setError(err.message || 'Could not resend OTP');
        } finally {
            setResendLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp.trim() || otp.trim().length < 6) {
            setError('Enter the 6-digit OTP');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            const res = await authAPI.resetPasswordWithOtp({
                identifier: identifier.trim(),
                otp: otp.trim(),
                newPassword,
            });
            if (res.success) {
                setDone(true);
            }
        } catch (err) {
            setError(err.message || 'Could not reset password');
        } finally {
            setLoading(false);
        }
    };

    if (done) {
        return (
            <AuthSplitShell
                heroEyebrow="All set"
                heroTitle="Password updated"
                heroSubtitle="Your password has been changed. Sign in with your new credentials."
                bullets={[]}
                alternateHref="/login"
                alternateLabel="Ready?"
                alternateCta="Go to sign in"
            >
                <div className="auth-form-surface-elevated relative z-[1]">
                    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/90 p-5 text-center">
                        <p className="text-sm font-semibold text-emerald-900">You can sign in now.</p>
                        <Button
                            type="button"
                            variant="primary"
                            className="mt-4 w-full py-3"
                            onClick={() => navigate('/login')}
                        >
                            Back to login
                        </Button>
                    </div>
                </div>
                <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">Hostel Management System · v2.1.0</p>
            </AuthSplitShell>
        );
    }

    return (
        <AuthSplitShell
            heroEyebrow="Account recovery"
            heroTitle="Reset your password"
            heroSubtitle="Use the phone registered on your account. You can look up by email — we still send the OTP to the mobile number linked to that account."
            bullets={[
                'Choose phone or email to identify your account',
                'Receive a one-time code (demo: check server console)',
                'Set a new password and sign in',
            ]}
            alternateHref="/login"
            alternateLabel="Remember it now?"
            alternateCta="Sign in"
        >
            <div className="auth-form-surface-elevated relative z-[1]">
                {step === 1 && (
                    <>
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 1</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Find your account</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                OTP is always sent to your <strong className="font-semibold text-slate-700">registered phone</strong>.
                            </p>
                        </div>

                        <div className="mb-6 flex rounded-xl border border-slate-200 bg-slate-50/80 p-1">
                            <button
                                type="button"
                                onClick={() => {
                                    setMethod('phone');
                                    setError('');
                                }}
                                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${method === 'phone'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Phone
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setMethod('email');
                                    setError('');
                                }}
                                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${method === 'email'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Email
                            </button>
                        </div>

                        <form onSubmit={handleSendOtp} className="space-y-5">
                            {method === 'phone' ? (
                                <Input
                                    label="Mobile number"
                                    name="phone"
                                    placeholder="10-digit number"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10));
                                        setError('');
                                    }}
                                    autoComplete="tel"
                                />
                            ) : (
                                <Input
                                    label="Email"
                                    type="email"
                                    name="email"
                                    placeholder="you@university.edu"
                                    value={identifier}
                                    onChange={(e) => {
                                        setIdentifier(e.target.value);
                                        setError('');
                                    }}
                                    autoComplete="email"
                                />
                            )}

                            {error && (
                                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800" role="alert">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 shadow-md shadow-brand-500/20"
                                loading={loading}
                            >
                                Send OTP
                            </Button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div className="mb-8">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">Step 2</p>
                            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Verify & set password</h2>
                            <p className="mt-2 text-sm text-slate-500">
                                OTP sent to <span className="font-mono font-semibold text-slate-800">{maskedPhone}</span>
                            </p>
                        </div>

                        {devOtp != null && (
                            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-900">
                                Dev only: OTP is <span className="font-mono">{devOtp}</span> (also in server console)
                            </div>
                        )}

                        <form onSubmit={handleReset} className="space-y-5">
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="otp">
                                    One-time password
                                </label>
                                <input
                                    id="otp"
                                    name="otp"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                                        setError('');
                                    }}
                                    placeholder="6-digit code"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center font-mono text-lg tracking-[0.35em] text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                                />
                            </div>

                            <Input
                                label="New password"
                                type="password"
                                name="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                            <Input
                                label="Confirm new password"
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                autoComplete="new-password"
                            />

                            {error && (
                                <p className="text-xs font-medium text-red-600" role="alert">
                                    {error}
                                </p>
                            )}

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 py-3"
                                    onClick={() => {
                                        setStep(1);
                                        setOtp('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setError('');
                                        setDevOtp(null);
                                    }}
                                >
                                    Back
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1 py-3"
                                    onClick={handleResend}
                                    loading={resendLoading}
                                    disabled={loading}
                                >
                                    Resend OTP
                                </Button>
                            </div>

                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full py-3 shadow-md shadow-brand-500/20"
                                loading={loading}
                            >
                                Reset password
                            </Button>
                        </form>
                    </>
                )}
            </div>

            <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">Hostel Management System · v2.1.0</p>
        </AuthSplitShell>
    );
};

export default ForgotPassword;
