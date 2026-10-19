import type { RoleDTO } from "../role/RoleDTO";

export interface CurrentUserDTO {
    name: string | null;
    email: string;
    role: RoleDTO | null;
}
