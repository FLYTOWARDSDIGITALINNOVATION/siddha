import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/Layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', { 
                token, 
                password 
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full">
                <div className="mb-6">
                    <Link to="/login" className="text-gray-500 hover:text-black font-semibold text-sm flex items-center gap-1 transition-colors">
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-serif font-black text-black mb-2 tracking-tight">Set New Password</h2>
                    <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                        Create a new password that is secure and easy to remember.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4 animate-fade-in">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle2 size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-green-900 font-bold mb-1">Password updated!</h3>
                            <p className="text-green-700 text-sm leading-relaxed">
                                {message}
                            </p>
                            <p className="text-green-600 text-[13px] mt-2 font-medium">Redirecting you to login...</p>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="relative">
                            <Input
                                label="New Password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Min. 8 characters"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 bottom-4 text-gray-400 hover:text-black transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <Input
                            label="Confirm New Password"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repeat your password"
                            icon={Lock}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-sm font-medium animate-shake">
                                <AlertCircle size={18} className="shrink-0" />
                                {error}
                            </div>
                        )}

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full !py-3 !rounded-xl !bg-black hover:!bg-gray-800 !text-white !text-base !font-bold !shadow-lg transition-all active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating Password...
                                </span>
                            ) : 'Update Password'}
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
};

export default ResetPassword;
