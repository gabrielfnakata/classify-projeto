export interface UserCreateDTO {
    email: string;
    password: string;
    roleId: string;
    employeeUuid: string | null;
}
