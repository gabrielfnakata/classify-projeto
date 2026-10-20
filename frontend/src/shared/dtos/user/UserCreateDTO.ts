export interface UserCreateDTO {
    email: string;
    password: string | null;
    roleId: string;
    employeeUuid: string | null;
}
