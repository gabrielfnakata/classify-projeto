import api from "@/services/api";
import type LoginResponseDTO  from "@/shared/dtos/auth/LoginResponseDTO";
import { createContext, useState, type ReactNode } from "react";

interface AuthContextData {
    signed: boolean,
    Login(cpf: string, password: string): Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = (params: { children: ReactNode }) => {

    const [loginData, setLoginData] = useState<LoginResponseDTO | null>(null);

    async function Login(cpf: string, password: string) {
        const response = await api.post<LoginResponseDTO>('/auth/login', {
            cpf: cpf,
            password: password
        });

        setLoginData(response.data);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
    }

    return (
        <AuthContext.Provider value={{ signed: Boolean(loginData), Login }}>
            {params.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;