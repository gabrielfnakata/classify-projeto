import type { JwtPayload } from "jwt-decode";
import type { Roles } from "@/shared/models/enums/roles";

export interface UserInfoDTO {
    email: string;
    role: Roles;
};

export interface TokenData extends JwtPayload {
    role: string;
}