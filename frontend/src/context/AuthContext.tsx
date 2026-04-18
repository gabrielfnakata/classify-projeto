import api from "@/services/api";
import type LoginResponseDTO  from "@/shared/dtos/auth/LoginResponseDTO";
import { createContext, useState } from "react";

interface AuthContextData {
    signed: boolean,
    Login(email: string, password: string): Promise<void>
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }) => {

    const [loginData, setLoginData] = useState<LoginResponseDTO | null>(null);

    async function Login(email: string, password: string) {
        const response = await api.post<LoginResponseDTO>('/auth/login', {
            email: email,
            password: password
        });

        console.log(response);
        setLoginData(response.data);
        api.defaults.headers.Authorization = `Bearer ${response.data?.accessToken}`;
    }

    return (
        <AuthContext.Provider value={{ signed: Boolean(loginData), Login }}>
            {children}
        </AuthContext.Provider>
    );
}

export default AuthContext;