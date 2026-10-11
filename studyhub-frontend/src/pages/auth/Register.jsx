import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Hash, 
  BookOpen, 
  Briefcase, 
  Building,
  Users,
  Shield,
  Loader2,
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import campusBg from '../../assets/images/college-campus.jpg';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        rollNumber: '',
        employeeId: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
        department: 'IT',
        year: '',
        semester: '',
        joiningYear: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const departments = [
        'IT',
        'CSE',
        'ECE',
        'EEE',
        'ME',
        'CE'
    ];

    const currentYear = new Date().getFullYear();
    const joiningYearOptions = [];
    for (let y = currentYear + 1; y >= 2020; y--) {
        joiningYearOptions.push({ value: String(y), label: `${y} Batch` });
    }

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.department) {
            newErrors.department = 'Department is required';
        }
        
        if (formData.role === 'STUDENT') {
            if (!formData.rollNumber) {
                newErrors.rollNumber = 'Roll number is required';
            } else if (formData.rollNumber.length < 5) {
                newErrors.rollNumber = 'Roll number must be at least 5 characters';
            }
            if (!formData.joiningYear) newErrors.joiningYear = 'Please select joining year';
            if (!formData.year) newErrors.year = 'Please select academic year';
            if (!formData.semester) newErrors.semester = 'Please select semester';
        }
        
        if (formData.role === 'TEACHER') {
            if (!formData.employeeId) {
                newErrors.employeeId = 'Employee ID is required';
            } else if (formData.employeeId.length < 4) {
                newErrors.employeeId = 'Employee ID must be at least 4 characters';
            }
        }
        
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const registrationData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                rollNumber: formData.role === 'STUDENT' ? formData.rollNumber : null,
                employeeId: formData.role === 'TEACHER' ? formData.employeeId : null,
                password: formData.password,
                role: formData.role,
                department: formData.department,
                branch: null,
                year: formData.role === 'STUDENT' ? parseInt(formData.year) : null,
                semester: formData.role === 'STUDENT' ? parseInt(formData.semester) : null,
                joiningYear: formData.role === 'STUDENT' && formData.joiningYear ? parseInt(formData.joiningYear, 10) : null,
            };

            const response = await api.post('/auth/register', registrationData);
            sessionStorage.setItem('registrationEmail', formData.email);
            
            const role = formData.role;
            if (role === 'STUDENT' || role === 'TEACHER' || role === 'ADMIN') {
                toast.success('Verification code sent to your email!');
                navigate('/verify-otp');
                return;
            }
            
            toast.success('Registration successful!');
            navigate('/login');
            
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed.';
            const lowerMsg = message.toLowerCase();
            
            if (lowerMsg.includes('already registered') || lowerMsg.includes('duplicate')) {
                if (lowerMsg.includes('roll number') || lowerMsg.includes('rollnumber')) {
                    setErrors({ rollNumber: 'This roll number is already registered to another account.' });
                    toast.error(`Roll number "${formData.rollNumber}" is already registered.`);
                } else if (lowerMsg.includes('employee id') || lowerMsg.includes('employeeid')) {
                    setErrors({ employeeId: 'This Employee ID is already registered to another account.' });
                    toast.error(`Employee ID "${formData.employeeId}" is already registered.`);
                } else if (lowerMsg.includes('email')) {
                    setErrors({ email: 'This email is already registered.' });
                    toast.error('This email is already registered. Please login.');
                } else {
                    toast.error(message);
                }
            } else {
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
            {/* Background Campus Image with Light Glass Tint */}
            <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${campusBg})` }}
            />
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]" />

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-full max-w-xl"
            >
                <div className="bg-white/35 backdrop-blur-2xl rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] border border-white/50 p-7 sm:p-9">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center h-14 px-3.5 bg-white/90 backdrop-blur-md border border-white/80 rounded-2xl shadow-sm mb-3">
                            <img 
                                src="/vvit-logo.png" 
                                alt="VVIT University Logo" 
                                className="h-10 w-auto object-contain"
                            />
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tight font-display drop-shadow-md">
                            Create Academic Account
                        </h1>
                        <p className="text-xs text-blue-100 mt-1 font-semibold drop-shadow-sm">
                            Register to access university coursework, notes, and AI assistance
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Role Selector */}
                        <div>
                            <label className="block text-[11px] font-bold text-white uppercase tracking-wider mb-2 drop-shadow-xs">
                                Register As
                            </label>
                            <div className="grid grid-cols-3 gap-2 bg-slate-950/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'STUDENT' }))}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        formData.role === 'STUDENT'
                                            ? 'bg-white text-[#0f2744] shadow-md'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Users size={14} />
                                    Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'TEACHER' }))}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        formData.role === 'TEACHER'
                                            ? 'bg-white text-[#0f2744] shadow-md'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <BookOpen size={14} />
                                    Faculty
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'ADMIN' }))}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        formData.role === 'ADMIN'
                                            ? 'bg-white text-[#0f2744] shadow-md'
                                            : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    <Shield size={14} />
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Name Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                    First Name <span className="text-red-300">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                        <User size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="e.g. John"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                            errors.firstName ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                        }`}
                                    />
                                </div>
                                {errors.firstName && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.firstName}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                    Last Name <span className="text-red-300">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="e.g. Doe"
                                    className={`w-full px-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                        errors.lastName ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                    }`}
                                />
                                {errors.lastName && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.lastName}</p>}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                Email Address <span className="text-red-300">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. yourname@university.edu"
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                        errors.email ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.email}</p>}
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                Department <span className="text-red-300">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                    <Building size={16} />
                                </div>
                                <select
                                    name="department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none cursor-pointer transition-all shadow-inner ${
                                        errors.department ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                    }`}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept} value={dept}>{dept} Department</option>
                                    ))}
                                </select>
                            </div>
                            {errors.department && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.department}</p>}
                        </div>

                        {/* Role-Specific Fields */}
                        {formData.role === 'STUDENT' && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                            Roll Number <span className="text-red-300">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                                <Hash size={16} />
                                            </div>
                                            <input
                                                type="text"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleChange}
                                                placeholder="e.g. 23BQ1A1267"
                                                className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                                    errors.rollNumber ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                                }`}
                                            />
                                        </div>
                                        {errors.rollNumber && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.rollNumber}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                            Joining Year <span className="text-red-300">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                                <Calendar size={16} />
                                            </div>
                                            <select
                                                name="joiningYear"
                                                value={formData.joiningYear}
                                                onChange={handleChange}
                                                className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none cursor-pointer transition-all shadow-inner ${
                                                    errors.joiningYear ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                                }`}
                                            >
                                                <option value="">Select Joining Year</option>
                                                {joiningYearOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.joiningYear && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.joiningYear}</p>}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                            Academic Year <span className="text-red-300">*</span>
                                        </label>
                                        <select
                                            name="year"
                                            value={formData.year}
                                            onChange={handleChange}
                                            className={`w-full px-3.5 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none cursor-pointer transition-all shadow-inner ${
                                                errors.year ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                            }`}
                                        >
                                            <option value="">Select Year</option>
                                            <option value="1">1st Year</option>
                                            <option value="2">2nd Year</option>
                                            <option value="3">3rd Year</option>
                                            <option value="4">4th Year</option>
                                        </select>
                                        {errors.year && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.year}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                            Semester <span className="text-red-300">*</span>
                                        </label>
                                        <select
                                            name="semester"
                                            value={formData.semester}
                                            onChange={handleChange}
                                            className={`w-full px-3.5 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none cursor-pointer transition-all shadow-inner ${
                                                errors.semester ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                            }`}
                                        >
                                            <option value="">Select Sem</option>
                                            <option value="1">Semester 1</option>
                                            <option value="2">Semester 2</option>
                                            <option value="3">Semester 3</option>
                                            <option value="4">Semester 4</option>
                                            <option value="5">Semester 5</option>
                                            <option value="6">Semester 6</option>
                                            <option value="7">Semester 7</option>
                                            <option value="8">Semester 8</option>
                                        </select>
                                        {errors.semester && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.semester}</p>}
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.role === 'TEACHER' && (
                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                    Employee ID <span className="text-red-300">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                        <Briefcase size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        placeholder="e.g. TCH2024001"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                            errors.employeeId ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                        }`}
                                    />
                                </div>
                                {errors.employeeId && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.employeeId}</p>}
                            </div>
                        )}

                        {/* Password Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                    Password <span className="text-red-300">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 6 characters"
                                        className={`w-full pl-10 pr-11 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                            errors.password ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                        }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5 drop-shadow-xs">
                                    Confirm Password <span className="text-red-300">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-white/75 backdrop-blur-md border rounded-xl text-sm font-semibold text-slate-900 placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-white outline-none transition-all shadow-inner ${
                                            errors.confirmPassword ? 'border-red-400 bg-red-50/80' : 'border-white/60'
                                        }`}
                                    />
                                </div>
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-200 font-semibold drop-shadow-sm">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* Info Note */}
                        <div className="bg-blue-900/40 backdrop-blur-md border border-blue-300/40 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-100 font-medium drop-shadow-xs">
                            <Info size={16} className="shrink-0 mt-0.5 text-blue-200" />
                            <span>A 6-digit OTP verification code will be sent to your email to complete registration.</span>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-950/40 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin h-4 w-4" />
                                    Processing registration...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-white/20 text-center">
                        <p className="text-xs text-white/90 font-medium drop-shadow-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-blue-200 hover:text-white font-bold underline hover:no-underline">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;