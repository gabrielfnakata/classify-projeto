import api from "@/services/api";
import { jwtDecode, type JwtPayload } from "jwt-decode";
import type LoginResponseDTO  from "@/shared/dtos/auth/LoginResponseDTO";
import type { TokenData, UserInfoDTO } from "@/shared/dtos/user/UserInfoDTO";
import { Roles } from "@/shared/models/enums/roles";
import type { LoginForm } from "@/shared/models/forms/loginForm";
import { createContext, useCallback, useEffect, useState, type ReactNode } from "react";

interface AuthContextData {
    signed: boolean,
    userData: UserInfoDTO | null,
    loading: boolean,
    login(values: LoginForm): Promise<void>,
    refresh(): Promise<void>,
    logout(): void
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = (params: { children: ReactNode }) => {

    const [loginData, setLoginData] = useState<LoginResponseDTO | null>(null);
    const [userData, setUserData] = useState<UserInfoDTO | null>(null);
    const [isLoading, setLoading] = useState(true);

    async function login(values: LoginForm) {
        const response = await api.post<LoginResponseDTO>('/auth/login', {
            email: values.email,
            password: values.password
        }, { skipExceptionModal: true });

        setLoginData(response.data);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
        if (values.rememberMe) {
            sessionStorage.setItem('refreshToken', response.data.refreshToken);
        }
    }

    const refresh = useCallback(async () => {
        const refreshToken = sessionStorage.getItem('refreshToken');
        
        const response = await api.post<LoginResponseDTO>('/auth/refresh', {
            refreshToken: refreshToken
        });
        
        sessionStorage.removeItem('refreshToken');
        sessionStorage.setItem('refreshToken', response.data.refreshToken);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
        setLoginData(response.data);
        getUserFromToken(response.data.accessToken);
    }, []);

    const logout = useCallback(() => {
        sessionStorage.removeItem('refreshToken');
        setLoginData(null);
        api.defaults.headers.Authorization = '';

    }, []);

    const getUserFromToken = useCallback((token: string) => {
        const { sub, role } = jwtDecode<TokenData>(token);
        setUserData({
            email: sub!,
            role: role as Roles
        });
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const initializeAuth = async () => {
            const refreshToken = sessionStorage.getItem('refreshToken');
            if (!refreshToken || controller.signal.aborted) {
                setLoading(false);
                return;
            }

            try {
                await refresh();
            } catch {
                if (!controller.signal.aborted) logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
        return () => controller.abort();
    }, []);

    return (
        <AuthContext.Provider value={{ signed: Boolean(loginData), userData: userData, loading: isLoading, login, refresh, logout }}>
            {params.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;