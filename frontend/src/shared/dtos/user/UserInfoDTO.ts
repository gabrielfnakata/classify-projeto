import type { JwtPayload } from "jwt-decode";

export interface UserInfoDTO {
    email: string;
    role: string;
};

export interface TokenData extends JwtPayload {
    role: string;
}