import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Heart } from 'lucide-react';
export function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "mx-auto max-w-md", children: _jsxs("div", { className: "rounded-2xl border border-rose-100 bg-white p-8 shadow-sm", children: [_jsxs("div", { className: "mb-6 text-center", children: [_jsx(Heart, { className: "mx-auto h-10 w-10 text-rose-500" }), _jsx("h1", { className: "mt-4 text-2xl font-bold text-gray-900", children: "Welcome back" }), _jsx("p", { className: "mt-2 text-sm text-gray-600", children: "Sign in to your SpeedDate account" })] }), error && _jsx("div", { className: "mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600", children: error }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, className: "mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500" })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full rounded-lg bg-rose-500 py-3 font-semibold text-white hover:bg-rose-600 disabled:opacity-50", children: loading ? 'Signing in...' : 'Sign in' })] }), _jsxs("p", { className: "mt-6 text-center text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "font-medium text-rose-600 hover:text-rose-700", children: "Sign up" })] })] }) }));
}
