export const TABLE_NAMES: { value: string; label: string }[] = [
    { value: "ALL", label: "Todas as tabelas" },
    { value: "STUDENT", label: "Alunos" },
    { value: "EMPLOYEE", label: "Funcionários" },
    { value: "USER", label: "Usuários" },
    { value: "CLASSROOM", label: "Salas" },
    { value: "SUBJECT", label: "Disciplinas" },
    { value: "SUBJECT_TEACHER", label: "Professor por Matéria" },
    { value: "CLASS", label: "Turmas" },
    { value: "CLASS_SESSION", label: "Aulas" },
    { value: "ASSESSMENT", label: "Avaliações" },
    { value: "REPORT", label: "Relatórios" },
    { value: "GUARDIAN", label: "Responsáveis" },
    { value: "TELEPHONE", label: "Telefones" },
    { value: "ADDRESS", label: "Endereços" },
];

export enum AuditTables {
    ALL = "ALL",
    STUDENT = "STUDENT",
    EMPLOYEE = "EMPLOYEE",
    USER = "USER",
    CLASSROOM = "CLASSROOM",
    SUBJECT = "SUBJECT",
    SUBJECT_TEACHER = "SUBJECT_TEACHER",
    CLASS = "CLASS",
    CLASS_SESSION = "CLASS_SESSION",
    ASSESSMENT = "ASSESSMENT",
    REPORT = "REPORT",
    GUARDIAN = "GUARDIAN",
    TELEPHONE = "TELEPHONE",
    ADDRESS = "ADDRESS"
}

export const normalizeTableName = (tableName: AuditTables) => {
    return TABLE_NAMES.find(table => tableName === table.value).label ?? '-';
}
