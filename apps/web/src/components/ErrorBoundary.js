import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error) {
        console.error('[ERROR_BOUNDARY]', error);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "flex min-h-screen items-center justify-center bg-gray-50 p-4", children: _jsxs("div", { className: "max-w-md text-center", children: [_jsx(AlertTriangle, { className: "mx-auto h-16 w-16 text-red-500" }), _jsx("h1", { className: "mt-4 text-2xl font-bold text-gray-900", children: "Something went wrong" }), _jsx("p", { className: "mt-2 text-gray-600", children: "An unexpected error occurred. Please try refreshing the page." }), _jsxs("button", { onClick: () => window.location.reload(), className: "mt-6 flex items-center gap-2 rounded-lg bg-rose-500 px-6 py-3 font-semibold text-white hover:bg-rose-600 mx-auto", children: [_jsx(RefreshCw, { className: "h-4 w-4" }), "Refresh Page"] })] }) }));
        }
        return this.props.children;
    }
}
