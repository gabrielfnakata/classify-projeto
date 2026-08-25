import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { StudentDTO } from "@/shared/dtos/student/StudentDTO";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Formik, Form } from "formik";
import { FormikInput } from "@/components/formik-input/FormikInput";
import CpfInput from "@/components/cpf-input/CpfInput";
import PhoneInput from "@/components/phone-input/PhoneInput";
import { FormGrid } from "@/components/features/form-grid";
import { Button } from "@/components/ui/button";
import { NewStudentValidationSchema } from "@/validation/StudentSchema";
import { formatTelephone, parseTelephone } from "@/shared/utils/telephone-parser";
import { formatCpf } from "@/shared/utils/cpf-formatter";
import api from "@/services/api";
import ConfirmDeleteDialog from "@/components/common/confirm-delete-dialog";

export default function StudentRegistration() {
    const columns: DataTableColumn<StudentDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'email', header: 'E-mail', cell: row => row.email},
        {key: 'cpf', header: 'CPF', cell: row => formatCpf(row.cpf)},
        {key: 'telephone', header: 'Telefone', cell: row => row.telephones.at(0) ? formatTelephone(row.telephones.at(0)!) : ''},
        {key: 'actions', header: 'Ações', cell: row => (
        <div className="flex gap-2">
            <Pencil 
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
                onClick={() => setStudentToEdit(row) }
            />
            <Trash2
                className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={() => setStudentToDelete(row)}
            />
        </div> )
        },
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 25},
        {name: 'email', inputType: 'text', placeholder: 'E-mail', width: 25},
        {name: 'cpf', inputType: 'cpf', placeholder: 'CPF', width: 25},
        {name: 'telephone', inputType: 'text', placeholder: 'Telefone', width: 25},
    ];
    const {data, refetch} = useFetch<StudentDTO>('/student');

    const [studentToEdit, setStudentToEdit] = useState<StudentDTO | null>(null);
    const [studentToDelete, setStudentToDelete] = useState<StudentDTO | null>(null);
    
    async function handleUpdateStudent(values: Record<string, unknown>) {
        const telephones = [values.telephone1, values.telephone2]
            .filter((phone): phone is string => Boolean(phone))
            .map(parseTelephone);

        const payload = {
            name: values.name,
            cpf: values.cpf,
            email: values.email,
            birthDate: values.birthDate,
            registrationDate: values.registrationDate,
            telephones,
            guardians: studentToEdit?.guardians ?? [],
        };

        await api.put(`/student/${studentToEdit?.uuid}`, payload);
        await refetch();
        setStudentToEdit(null);
    }

    async function handleDeleteStudent() {
        if (!studentToDelete) return;
        await api.delete(`/student/${studentToDelete.uuid}`);
        await refetch();
        setStudentToDelete(null);
    }

    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Alunos"
                registrationRoute="/new-student"
            >
            </RegistrationPage>

            <Dialog open={!!studentToEdit} onOpenChange={(open) => !open && setStudentToEdit(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Aluno: {studentToEdit?.name}</DialogTitle>
                    </DialogHeader>
                    {studentToEdit && (
                        <Formik
                            key={studentToEdit.uuid}
                            initialValues={{
                                name: studentToEdit.name,
                                birthDate: studentToEdit.birthDate,
                                email: studentToEdit.email,
                                cpf: studentToEdit.cpf,
                                registrationDate: studentToEdit.registrationDate,
                                telephone1: studentToEdit.telephones[0] ? formatTelephone(studentToEdit.telephones[0]) : '',
                                telephone2: studentToEdit.telephones[1] ? formatTelephone(studentToEdit.telephones[1]) : '',
                            }}
                            validationSchema={NewStudentValidationSchema}
                            onSubmit={handleUpdateStudent}
                        >
                            <Form className="flex flex-col gap-4 p-5">
                                <FormGrid>
                                    <FormikInput name="name" label="Nome" type="text" required />
                                    <FormikInput name="birthDate" label="Data de Nascimento" type="date" required />
                                    <FormikInput name="email" label="E-mail" type="text" required />
                                    <CpfInput name="cpf" label="CPF" required />
                                    <FormikInput name="registrationDate" label="Data de matrícula" type="date" required />
                                    <PhoneInput name="telephone1" label="Telefone 1" required />
                                    <PhoneInput name="telephone2" label="Telefone 2" />
                                </FormGrid>
                                <div className="flex flex-row justify-end gap-3">
                                    <Button type="button" variant="ghost" onClick={() => setStudentToEdit(null)}>
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        Salvar
                                    </Button>
                                </div>
                            </Form>
                        </Formik>
                    )}
                </DialogContent>
            </Dialog> 

            <ConfirmDeleteDialog
                open={!!studentToDelete}
                onOpenChange={(open) => !open && setStudentToDelete(null)}
                title="Excluir aluno"
                description={`Tem certeza que deseja excluir o aluno "${studentToDelete?.name}"? Essa ação não pode ser desfeita.`}
                onConfirm={handleDeleteStudent}
            />
             
        </>
    );
};
