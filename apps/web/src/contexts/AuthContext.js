import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const refreshUser = useCallback(async () => {
        try {
            const response = await api('/api/v1/auth/me');
            setUser(response.data.user);
            setProfile(response.data.profile);
        }
        catch {
            setUser(null);
            setProfile(null);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);
    const login = async (email, password) => {
        const response = await api('/api/v1/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        setUser(response.data.user);
        await refreshUser();
    };
    const register = async (data) => {
        const response = await api('/api/v1/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        setUser(response.data.user);
        await refreshUser();
    };
    const logout = async () => {
        await api('/api/v1/auth/logout', { method: 'POST' });
        setUser(null);
        setProfile(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, profile, loading, login, register, logout, refreshUser }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
