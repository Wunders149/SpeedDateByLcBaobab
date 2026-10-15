import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
export function NotFoundPage() {
    return (_jsx("div", { className: "flex min-h-[60vh] items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx(Heart, { className: "mx-auto h-16 w-16 text-rose-300" }), _jsx("h1", { className: "mt-4 text-6xl font-bold text-rose-500", children: "404" }), _jsx("h2", { className: "mt-2 text-2xl font-semibold text-gray-900", children: "Page not found" }), _jsx("p", { className: "mt-2 text-gray-600", children: "The page you're looking for doesn't exist or has been moved." }), _jsxs(Link, { to: "/", className: "mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600", children: [_jsx(Home, { className: "h-4 w-4" }), "Go Home"] })] }) }));
}
