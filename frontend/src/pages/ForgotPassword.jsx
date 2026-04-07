import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/Layout/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Gmail validation
        const lowerEmail = formData.email.toLowerCase();
        if (!lowerEmail.endsWith('@gmail.com') && lowerEmail !== 'admin@siddhaveda.com') {
            setError('Please use a valid @gmail.com email address or the authorized admin email.');
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL || "https://jclsiddhaacademy.in"}/api/auth/direct-password-reset`, { 
                email: formData.email,
                password: formData.newPassword 
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            console.error('Password reset error details:', err);
            const serverMessage = err.response?.data?.message;
            if (serverMessage) {
                setError(serverMessage);
            } else if (err.message === 'Network Error') {
                setError('Could not connect to the server. Please ensure the backend is running on ${process.env.REACT_APP_API_URL || "https://jclsiddhaacademy.in"}');
            } else {
                setError('Something went wrong. Please check your console or try again later.');
            }
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
                    <h2 className="text-3xl font-serif font-black text-black mb-2 tracking-tight">Reset Password</h2>
                    <p className="text-gray-500 text-base leading-relaxed max-w-sm">
                        Enter your email and your new password to update it directly.
                    </p>
                </div>

                {message ? (
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8 flex items-start gap-4 animate-fade-in">
                        <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle2 size={24} className="text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-green-900 font-bold mb-1">Success!</h3>
                            <p className="text-green-700 text-sm leading-relaxed">
                                {message}
                            </p>
                            <p className="text-green-600 text-[13px] mt-2 font-medium">Redirecting to login...</p>
                        </div>
                    </div>
                ) : (
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="user@gmail.com"
                            icon={Mail}
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="New Password"
                                name="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                icon={Lock}
                                value={formData.newPassword}
                                onChange={handleChange}
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
                            placeholder="Repeat new password"
                            icon={Lock}
                            value={formData.confirmPassword}
                            onChange={handleChange}
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
                                    Updating...
                                </span>
                            ) : 'Update Password'}
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
};

export default ForgotPassword;
