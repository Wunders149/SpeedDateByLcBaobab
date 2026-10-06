import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
export function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        dateOfBirth: '',
        agreedToRules: false,
        agreedToPrivacy: false,
        consentToMatching: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.agreedToRules || !formData.agreedToPrivacy || !formData.consentToMatching) {
            setError('Please agree to all terms and conditions');
            return;
        }
        setLoading(true);
        try {
            await register({
                email: formData.email,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
                agreedToRules: formData.agreedToRules,
                agreedToPrivacy: formData.agreedToPrivacy,
                consentToMatching: formData.consentToMatching,
            });
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "mx-auto max-w-lg", children: _jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx(Heart, { className: "mx-auto h-10 w-10 text-rose-500" }), _jsx("h1", { className: "mt-4 text-2xl font-bold text-gray-900", children: "Create your account" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Join SpeedDate and start meeting compatible people" })] }), error && (_jsx("div", { className: "mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "firstName", className: "block text-sm font-medium text-gray-700", children: "First name" }), _jsx("input", { id: "firstName", name: "firstName", value: formData.firstName, onChange: handleChange, required: true, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "lastName", className: "block text-sm font-medium text-gray-700", children: "Last name" }), _jsx("input", { id: "lastName", name: "lastName", value: formData.lastName, onChange: handleChange, required: true, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" })] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", name: "email", type: "email", value: formData.email, onChange: handleChange, required: true, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", name: "password", type: "password", value: formData.password, onChange: handleChange, required: true, minLength: 8, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "Must be at least 8 characters" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "dateOfBirth", className: "block text-sm font-medium text-gray-700", children: "Date of birth" }), _jsx("input", { id: "dateOfBirth", name: "dateOfBirth", type: "date", value: formData.dateOfBirth, onChange: handleChange, required: true, max: new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "You must be at least 18 years old" })] }), _jsxs("div", { className: "space-y-3 rounded-lg bg-gray-50 p-4", children: [_jsxs("label", { className: "flex items-start gap-3", children: [_jsx("input", { type: "checkbox", name: "agreedToRules", checked: formData.agreedToRules, onChange: handleChange, className: "mt-1" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["I agree to the ", _jsx(Link, { to: "/rules", className: "text-rose-600 hover:underline", children: "event rules" })] })] }), _jsxs("label", { className: "flex items-start gap-3", children: [_jsx("input", { type: "checkbox", name: "agreedToPrivacy", checked: formData.agreedToPrivacy, onChange: handleChange, className: "mt-1" }), _jsxs("span", { className: "text-sm text-gray-600", children: ["I agree to the ", _jsx(Link, { to: "/privacy", className: "text-rose-600 hover:underline", children: "privacy policy" })] })] }), _jsxs("label", { className: "flex items-start gap-3", children: [_jsx("input", { type: "checkbox", name: "consentToMatching", checked: formData.consentToMatching, onChange: handleChange, className: "mt-1" }), _jsx("span", { className: "text-sm text-gray-600", children: "I consent to participating in the matching process" })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50", children: loading ? 'Creating account...' : 'Create account' })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-gray-600", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-rose-600 hover:text-rose-700", children: "Sign in" })] })] }) }));
}
