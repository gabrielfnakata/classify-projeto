import api from "@/services/api";
import type LoginResponseDTO  from "@/shared/dtos/auth/LoginResponseDTO";
import type { LoginForm } from "@/shared/models/forms/loginForm";
import { createContext, useEffect, useState, type ReactNode } from "react";

interface AuthContextData {
    signed: boolean,
    login(values: LoginForm): Promise<void>,
    refresh(): Promise<void>,
    logout(): void
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = (params: { children: ReactNode }) => {

    const [loginData, setLoginData] = useState<LoginResponseDTO | null>(null);

    async function login(values: LoginForm) {
        const response = await api.post<LoginResponseDTO>('/auth/login', {
            cpf: values.cpf,
            password: values.password
        });

        setLoginData(response.data);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
        if (values.rememberMe) {
            sessionStorage.setItem('refreshToken', response.data.refreshToken);
        }
    }

    async function refresh() {
        const refreshToken = sessionStorage.getItem('refreshToken');
        sessionStorage.removeItem('refreshToken');

        const response = await api.post<LoginResponseDTO>('/auth/refresh', {
            refreshToken: refreshToken
        });

        setLoginData(response.data);
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
    }

    function logout() {
        sessionStorage.removeItem('refreshToken');
        setLoginData(null);
        api.defaults.headers.Authorization = '';
    }

    useEffect(() => {
        const controller = new AbortController();
        const initializeAuth = async () => {
            const refreshToken = sessionStorage.getItem('refreshToken');
            if (!refreshToken || controller.signal.aborted) return;

            try {
                await refresh();
            } catch {
                if (!controller.signal.aborted) logout();
            }
        };

        initializeAuth();
        return () => controller.abort();
    }, []);

    return (
        <AuthContext.Provider value={{ signed: Boolean(loginData), login, refresh, logout }}>
            {params.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;