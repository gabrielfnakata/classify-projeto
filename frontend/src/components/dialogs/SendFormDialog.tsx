import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Loader2, Send} from "lucide-react";
import type {StudentDTO} from "@/shared/dtos/student/StudentDTO.ts";
import type {ClassGroupDTO} from "@/shared/dtos/class-group/ClassGroupDTO";
import {FormAssignType} from "@/shared/models/enums/form-assign-type.ts";
import {type FormikHelpers, useFormik} from "formik";
import api from "@/services/api.ts";
import {SendFormSchema} from "@/validation/SendFormSchema.ts";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "../ui/tabs";
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor
} from "../ui/combobox";
import {Button} from "../ui/button";
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip";
import {useState} from "react";
import type {AssignFormToClassDTO} from "@/shared/dtos/form-assign/AssignFormToClassDTO.ts";
import type {AssignFormToStudentsDTO} from "@/shared/dtos/form-assign/AssignFormToStudentsDTO.ts";

interface SendFormDialogProps {
    formId: string;
    studentData: StudentDTO[];
    classData: ClassGroupDTO[];
}

interface SendFormValues {
    type: FormAssignType;
    formUuid: string;
    students: Option[];
    classGroup: Option;
}

interface Option {
    value: string;
    label: string;
}

const toOption = (entity: StudentDTO | ClassGroupDTO): Option => {
    return {
        value: entity.uuid,
        label: entity.name
    };
}

export default function SendFormDialog({formId, studentData, classData}: SendFormDialogProps) {
    const [open, setOpen] = useState(false);
    const anchor = useComboboxAnchor();
    // TODO: adicionar dialog de confirmação (depende do context)

    const handleTabChange = (value: string) => {
        setValues({
            ...values,
            type: value as FormAssignType,
            students: [],
            classGroup: { value: '', label: '' },
        });
    };

    const buildPayload = (values: SendFormValues): AssignFormToClassDTO | AssignFormToStudentsDTO => {
        return values.type === FormAssignType.CLASS
            ? {
                formUuid: values.formUuid,
                classUuid: values.classGroup.value
            } as AssignFormToClassDTO
            : {
                formUuid: values.formUuid,
                students: values.students.map(option => {return {uuid: option.value}})
            } as AssignFormToStudentsDTO;
    };

    const handleSubmit = async (values: SendFormValues, helpers: FormikHelpers<SendFormValues>) => {
        helpers.setSubmitting(true);
        try {
            const payload = buildPayload(values);
            const url = values.type === FormAssignType.CLASS
                ? '/form/send/class'
                : '/form/send/students';
            await api.post(url, payload).then(() => {
                alert('Formulário enviado com sucesso.');
                setOpen(false);
            });
        } catch (error) {
            console.error(error);
            alert("Não foi possível enviar o formulário");
        } finally {
            helpers.setSubmitting(false);
        }

    };

    const formik = useFormik<SendFormValues>({
        initialValues: {
            type: FormAssignType.STUDENT,
            formUuid: formId,
            students: [],
            classGroup: { value: '', label: '' },
        },
        validationSchema: SendFormSchema,
        validateOnMount: true,
        enableReinitialize: true,
        onSubmit: handleSubmit,
    });

    const {values, isValid, isSubmitting, setValues, setFieldValue, submitForm} = formik;

    const studentOptions = studentData.map(toOption) ?? [];
    const classOptions = classData.map(toOption) ?? [];

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Send className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"/>
                        </TooltipTrigger>
                        <TooltipContent>Enviar Formulário</TooltipContent>
                    </Tooltip>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Enviar Formulário</DialogTitle>
                        <DialogDescription>
                            Escolha se deseja enviar para alunos específicos ou para uma turma inteira.
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs value={values.type} onValueChange={handleTabChange} className="w-full">
                        <TabsList className="w-full">
                            <TabsTrigger value={FormAssignType.STUDENT} className="flex-1">
                                Alunos
                            </TabsTrigger>
                            <TabsTrigger value={FormAssignType.CLASS} className="flex-1">
                                Turmas
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={FormAssignType.STUDENT} className="flex flex-col gap-2 p-4">
                            <Combobox
                                items={studentOptions}
                                multiple
                                value={values.students}
                                onValueChange={(students) => {setFieldValue("students", students)}}
                                isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
                            >
                            <ComboboxChips ref={anchor}>
                                <ComboboxValue>
                                    {(selected: Option[]) => selected.map((option) => (
                                        <ComboboxChip key={option.value} aria-label={option.label}>
                                            {option.label}
                                        </ComboboxChip>
                                    ))}
                                </ComboboxValue>
                                <ComboboxChipsInput placeholder="Buscar e adicionar alunos..."/>
                            </ComboboxChips>
                            <ComboboxContent anchor={anchor} onWheel={(e) => e.stopPropagation()}
                                             className="pointer-events-auto">
                                <ComboboxEmpty>
                                    Nenhum aluno encontrado.
                                </ComboboxEmpty>
                                <ComboboxList>
                                    {(option: Option) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        {formik.touched.students && formik.errors.students && (
                                <p className="text-sm text-destructive">{formik.errors.students as string}</p>
                            )}
                        </TabsContent>

                        <TabsContent value={FormAssignType.CLASS} className="flex flex-col gap-2 p-4">
                            <Combobox
                                items={classOptions}
                                value={values.classGroup}
                                onValueChange={(classGroup) => setFieldValue("classGroup", classGroup)}
                                isItemEqualToValue={(a: Option, b: Option) => a.value === b.value}
                            >
                                <ComboboxInput placeholder="Selecionar turma"/>
                                <ComboboxContent
                                    anchor={anchor}
                                    onWheel={(e) => e.stopPropagation()}
                                    className="pointer-events-auto"
                                >
                                    <ComboboxEmpty>
                                        Nenhuma turma encontrada.
                                    </ComboboxEmpty>
                                    <ComboboxList>
                                        {(option: Option) => (
                                            <ComboboxItem key={option.value} value={option}>
                                                {option.label}
                                            </ComboboxItem>
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                            {formik.touched.classGroup && formik.errors.classGroup && (
                                <p className="text-sm text-destructive">{formik.errors.classGroup as string}</p>
                            )}
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="pt-2">
                        <DialogClose asChild>
                            <Button variant="secondary" disabled={isSubmitting} className="hover:cursor-pointer">
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button onClick={submitForm} disabled={!isValid || isSubmitting} className="hover:cursor-pointer">
                            {isSubmitting
                                ? <Loader2 className="h-4 w-4 animate-spin"/>
                                : <Send className="h-4 w-4"/>
                            }
                            Enviar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
