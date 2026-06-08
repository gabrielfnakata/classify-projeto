import api from "@/services/api";
import type { RegisterStudentsForm } from "@/shared/models/forms/registerStudentsForm";

function stripPhone(phone: string): string {
    return phone.replace(/\D/g, "");
}

export interface GradeOption {
    label: string;
    value: string;
}

export async function fetchGrades(): Promise<GradeOption[]> {
    const { data } = await api.get("/grade");
    return data.map((g: { id: number; description: string }) => ({
        label: g.description,
        value: String(g.id),
    }));
}

export async function registerStudent(values: RegisterStudentsForm): Promise<void> {
    const today = new Date().toISOString().split("T")[0];

const payload = {
    name: values.fullName,
    birthDate: values.birthDate,
    registrationDate: today,
    email: values.email,
    telephone: stripPhone(values.guardian1Phone),
    address: values.address,
    neighborhood: values.neighborhood,
    school: values.school,
    grade: Number(values.grade),
    referral: values.referral === "true",
    referrerName: values.referral === "true" ? values.referrerName : null,
    guardians: [
        {
            name: values.guardian1Name,
            telephone: stripPhone(values.guardian1Phone),
            parentage: values.parentage1,
        },
        ...(values.guardian2Name ? [{
            name: values.guardian2Name,
            telephone: stripPhone(values.guardian2Phone),
            parentage: values.parentage2,
        }] : []),
    ],
};

    await api.post("/student", payload);
}