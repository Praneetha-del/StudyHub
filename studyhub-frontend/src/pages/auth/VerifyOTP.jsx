import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, Clock, RefreshCw, ArrowLeft, CheckCircle, Users, UserCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import campusBg from '../../assets/images/college-campus.jpg';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [verified, setVerified] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [verificationError, setVerificationError] = useState(''); 

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('registrationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            toast.error('Please register first');
            navigate('/register');
        }

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        setVerificationError('');
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            const lastInput = document.getElementById('otp-5');
            if (lastInput) lastInput.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setVerificationError('');
        
        try {
            // ✅ FIXED: Use /verify/otp endpoint (not /verify)
            const response = await api.post('/auth/verify/otp', {
                email: email,
                code: otpCode
            });
            
            console.log('✅ Verification response:', response.data);
            
            // Check if verification was successful
            if (response.data && response.data.success) {
                const responseData = response.data.data;
                
                if (responseData && responseData.user) {
                    setUserRole(responseData.user.role);
                    setUserName(responseData.user.firstName);
                }
                
                // ✅ ADMIN gets token immediately
                if (responseData && responseData.accessToken) {
                    const { accessToken, user } = responseData;
                    localStorage.setItem('token', accessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    
                    setVerified(true);
                    toast.success('✅ Admin registration complete!');
                    
                    setTimeout(() => {
                        navigate('/admin/dashboard');
                    }, 2000);
                    return;
                }
                
                // ✅ STUDENT and TEACHER - Pending approval
                setVerified(true);
                toast.success('✅ OTP verified successfully!');
                
                // ✅ Don't redirect to login automatically, show pending page
                
            } else {
                const message = response.data?.message || 'Invalid verification code';
                setVerificationError(message);
                toast.error(message);
                setOtp(['', '', '', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
            
        } catch (error) {
            console.error('❌ Verification error:', error);
            const message = error.response?.data?.message || 'Invalid verification code';
            setVerificationError(message);
            toast.error(message);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', null, {
                params: { email }
            });
            toast.success('📧 New code sent to your email!');
            setTimer(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setVerificationError('');
            document.getElementById('otp-0')?.focus();
            
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const goToLogin = () => {
        navigate('/login');
    };

    // ✅ PENDING APPROVAL PAGE
    if (verified && userRole !== 'ROLE_ADMIN') {
        return (
            <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${campusBg})` }}
                />
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md w-full bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-8 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-amber-500/20 border border-amber-300/40 rounded-2xl flex items-center justify-center text-amber-300 shadow-sm backdrop-blur-md">
                            <Clock size={32} />
                        </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-200 border border-amber-300/30 mb-3">
                        Approval Pending
                    </span>
                    <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Registration Submitted!</h2>
                    <p className="text-blue-100 text-sm mb-2 drop-shadow-sm">
                        Welcome, <strong className="text-white font-bold">{userName || 'Student/Faculty'}</strong>! Your account has been created.
                    </p>
                    <p className="text-slate-200 text-xs mb-6 drop-shadow-sm">
                        Your account requires department administrator approval before you can sign in.
                    </p>
                    
                    <div className="bg-blue-900/40 backdrop-blur-md border border-blue-300/40 rounded-xl p-4 mb-6 text-left drop-shadow-xs">
                        <div className="flex items-start space-x-3">
                            <Users className="text-blue-200 mt-0.5 flex-shrink-0" size={18} />
                            <div>
                                <p className="text-xs text-white font-bold uppercase tracking-wider">Next Steps</p>
                                <ul className="text-xs text-blue-100 mt-1.5 space-y-1 font-medium">
                                    <li className="flex items-center gap-1.5">✓ Department Admin will review your profile</li>
                                    <li className="flex items-center gap-1.5">✓ You will receive confirmation when active</li>
                                    <li className="flex items-center gap-1.5">✓ Once approved, log in with your credentials</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={goToLogin}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-950/40 transition-all cursor-pointer"
                    >
                        Back to Login
                    </button>
                    
                    <p className="text-xs text-slate-200 mt-4 drop-shadow-xs">
                        📧 Questions? Contact your department administrator
                    </p>
                </motion.div>
            </div>
        );
    }

    // ✅ ADMIN SUCCESS PAGE
    if (verified && userRole === 'ROLE_ADMIN') {
        return (
            <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                    style={{ backgroundImage: `url(${campusBg})` }}
                />
                <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 text-center max-w-md w-full bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-8"
                >
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-300/40 rounded-2xl flex items-center justify-center text-emerald-300 shadow-sm backdrop-blur-md">
                            <CheckCircle size={32} />
                        </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 mb-3">
                        Admin Verified
                    </span>
                    <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md">Registration Complete! 🎉</h2>
                    <p className="text-blue-100 text-sm drop-shadow-sm">Your administrator account is active and verified.</p>
                    <p className="text-xs text-white font-bold mt-4 drop-shadow-sm">Redirecting to admin dashboard...</p>
                </motion.div>
            </div>
        );
    }

    // ✅ OTP VERIFICATION PAGE
    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${campusBg})` }}
            />
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-8">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('registrationEmail');
                            navigate('/register');
                        }}
                        className="flex items-center text-xs font-bold text-blue-200 hover:text-white mb-6 transition-colors drop-shadow-sm cursor-pointer"
                    >
                        <ArrowLeft size={16} className="mr-1.5" />
                        Back to Registration
                    </button>

                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl text-blue-600 shadow-sm">
                                <Shield size={28} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">Verify Your Email</h1>
                        <p className="text-blue-100 text-xs mt-1 font-semibold drop-shadow-sm">
                            We've sent a 6-digit verification code to
                        </p>
                        <p className="text-white font-black text-sm mt-0.5 drop-shadow-sm">
                            {email}
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-3 text-center drop-shadow-xs">
                                Enter 6-Digit Code
                            </label>
                            <div className="flex justify-center gap-2 sm:gap-2.5" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-11 sm:w-12 h-13 sm:h-14 text-center text-2xl font-black text-slate-900 bg-white/85 backdrop-blur-md border border-white/60 rounded-xl focus:bg-white focus:border-white focus:ring-4 focus:ring-blue-400 outline-none transition-all shadow-inner"
                                        maxLength={1}
                                        autoFocus={index === 0}
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                            {verificationError && (
                                <div className="mt-3 p-2.5 bg-red-500/20 border border-red-300/40 rounded-xl text-xs text-red-200 text-center font-bold drop-shadow-sm">
                                    {verificationError}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.some(d => !d)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-950/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying Code...
                                </span>
                            ) : (
                                'Verify & Complete'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex items-center text-xs text-white/90 font-medium drop-shadow-sm">
                            <Clock size={14} className="mr-1 text-blue-200" />
                            <span>Expires in: <strong className={timer < 60 ? 'text-red-300' : 'text-white'}>{formatTime(timer)}</strong></span>
                        </div>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || resendLoading}
                            className="text-xs text-blue-200 hover:text-white font-bold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors drop-shadow-sm cursor-pointer"
                        >
                            <RefreshCw size={13} className={`${resendLoading ? 'animate-spin' : ''}`} />
                            {resendLoading ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>

                    <div className="mt-5 p-3.5 bg-white/20 backdrop-blur-md rounded-xl border border-white/30">
                        <p className="text-xs text-white text-center leading-relaxed font-medium drop-shadow-xs">
                            💡 Didn't receive the email? Check your spam/junk folder or request a new code.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;