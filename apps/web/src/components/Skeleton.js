import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function CardSkeleton() {
    return (_jsxs("div", { className: "animate-pulse rounded-2xl border border-rose-100 bg-white p-6 shadow-sm", children: [_jsx("div", { className: "h-6 w-3/4 rounded bg-gray-200" }), _jsx("div", { className: "mt-3 h-4 w-full rounded bg-gray-200" }), _jsx("div", { className: "mt-2 h-4 w-5/6 rounded bg-gray-200" }), _jsxs("div", { className: "mt-4 flex gap-2", children: [_jsx("div", { className: "h-8 w-24 rounded-full bg-gray-200" }), _jsx("div", { className: "h-8 w-24 rounded-full bg-gray-200" })] })] }));
}
export function StatSkeleton() {
    return (_jsx("div", { className: "animate-pulse rounded-xl border border-rose-100 bg-white p-4", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200" }), _jsxs("div", { children: [_jsx("div", { className: "h-6 w-12 rounded bg-gray-200" }), _jsx("div", { className: "mt-1 h-4 w-20 rounded bg-gray-200" })] })] }) }));
}
export function TableSkeleton({ rows = 5 }) {
    return (_jsx("div", { className: "animate-pulse space-y-3", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: "flex items-center gap-4 rounded-lg border border-gray-100 p-3", children: [_jsx("div", { className: "h-10 w-10 rounded-full bg-gray-200" }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "h-4 w-1/3 rounded bg-gray-200" }), _jsx("div", { className: "mt-2 h-3 w-1/4 rounded bg-gray-200" })] }), _jsx("div", { className: "h-6 w-16 rounded bg-gray-200" })] }, i))) }));
}
