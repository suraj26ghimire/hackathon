import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear the specific field error when the user starts typing
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
        if (generalError) setGeneralError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setGeneralError('');
        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/profile');
        } catch (err) {
            const data = err.response?.data;
            if (data && typeof data === 'object') {
                // DRF returns { field: ["error message", ...], ... }
                const fieldErrors = {};
                let hasFieldError = false;
                for (const [field, messages] of Object.entries(data)) {
                    const msgList = Array.isArray(messages) ? messages : [messages];
                    if (['username', 'email', 'password'].includes(field)) {
                        fieldErrors[field] = msgList;
                        hasFieldError = true;
                    }
                }
                if (hasFieldError) {
                    setErrors(fieldErrors);
                }
                // Handle non_field_errors or detail key
                if (data.non_field_errors) {
                    setGeneralError(
                        Array.isArray(data.non_field_errors)
                            ? data.non_field_errors.join(' ')
                            : data.non_field_errors
                    );
                } else if (data.detail) {
                    setGeneralError(data.detail);
                } else if (!hasFieldError) {
                    setGeneralError('Registration failed. Please check your inputs and try again.');
                }
            } else {
                setGeneralError('Registration failed. Please try again later.');
            }
        }
    };

    const fieldBorder = (field) =>
        errors[field]
            ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
            : 'border-gray-300 focus:ring-primary focus:border-primary';

    return (
        <div className="max-w-md mx-auto mt-20 glass p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-center text-text mb-8">Create Account</h2>

            {/* General / non-field error banner */}
            {generalError && (
                <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{generalError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Username</label>
                    <input
                        type="text"
                        name="username"
                        className={`w-full px-4 py-2 border rounded-lg outline-none ${fieldBorder('username')}`}
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    {errors.username && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.username.join(' ')}</span>
                        </div>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        className={`w-full px-4 py-2 border rounded-lg outline-none ${fieldBorder('email')}`}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    {errors.email && (
                        <div className="flex items-center gap-1.5 mt-1.5 text-red-600 text-xs">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{errors.email.join(' ')}</span>
                        </div>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium text-text-muted mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        className={`w-full px-4 py-2 border rounded-lg outline-none ${fieldBorder('password')}`}
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    {errors.password && (
                        <div className="mt-1.5 text-red-600 text-xs space-y-0.5">
                            {errors.password.map((msg, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                    <span>{msg}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    className="w-full btn-primary py-2.5"
                >
                    Register
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-text-muted">
                Already have an account? <Link to="/login" className="text-primary hover:underline">Sign In</Link>
            </p>
        </div>
    );
};

export default Register;

