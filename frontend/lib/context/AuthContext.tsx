'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isVerified?: boolean;
    addresses?: any[];
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<User>;
    register: (name: string, email: string, password: string) => Promise<User>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const response = await api.post('/auth/login', { email, password });
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        return user;
    };

    const register = async (name: string, email: string, password: string): Promise<any> => {
        const response = await api.post('/auth/register', { name, email, password });
        const { token, user, requiresVerification } = response.data;

        // If email verification is required, return without storing auth
        if (requiresVerification) {
            return { requiresVerification: true };
        }

        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
        }
        return user || response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
