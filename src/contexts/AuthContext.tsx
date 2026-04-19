import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL;
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;
const ADMIN_USER = import.meta.env.VITE_KEYCLOAK_ADMIN_USER;
const ADMIN_PASSWORD = import.meta.env.VITE_KEYCLOAK_ADMIN_PASSWORD;

interface AuthUser {
    username: string;
    token: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    register: (username: string, email: string, password: string) => Promise<void>;
    refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('rango_token');
        const username = localStorage.getItem('rango_username');
        if (token && username) {
            setUser({ username, token });
        }
        setIsLoading(false);
    }, []);

    async function login(username: string, password: string) {
        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            username,
            password,
        });

        const { data } = await axios.post(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        localStorage.setItem('rango_token', data.access_token);
        localStorage.setItem('rango_refresh_token', data.refresh_token);
        localStorage.setItem('rango_username', username);
        setUser({ username, token: data.access_token });
    }

    async function refreshToken() {
        const refresh_token = localStorage.getItem('rango_refresh_token');
        if (!refresh_token) throw new Error('No refresh token available');

        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token,
        });

        const { data } = await axios.post(
            `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            params,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        localStorage.setItem('rango_token', data.access_token);
        localStorage.setItem('rango_refresh_token', data.refresh_token);
        setUser(prev => prev ? { ...prev, token: data.access_token } : null);
        return data.access_token;
    }

    function logout() {
        localStorage.removeItem('rango_token');
        localStorage.removeItem('rango_refresh_token');
        localStorage.removeItem('rango_username');
        setUser(null);
    }

    async function register(username: string, email: string, password: string) {
        // 1. Obter token de admin via admin-cli
        const adminParams = new URLSearchParams({
            grant_type: 'password',
            client_id: 'admin-cli',
            username: ADMIN_USER,
            password: ADMIN_PASSWORD,
        });
        const { data: adminData } = await axios.post(
            `${KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
            adminParams,
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const adminToken = adminData.access_token;

        // 2. Criar usuário no realm
        const createRes = await axios.post(
            `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users`,
            { username, email, enabled: true },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );

        // 3. Extrair o ID do usuário criado (vem no header Location)
        const location: string = createRes.headers['location'] ?? '';
        const userId = location.split('/').pop();
        if (!userId) throw new Error('Não foi possível obter o ID do usuário criado.');

        // 4. Definir a senha do usuário
        await axios.put(
            `${KEYCLOAK_URL}/admin/realms/${KEYCLOAK_REALM}/users/${userId}/reset-password`,
            { type: 'password', value: password, temporary: false },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, register, refreshToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
