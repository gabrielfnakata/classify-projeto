import * as yup from "yup";

export const NewClassroomValidationSchema = yup.object({
    name: yup.string().required(),
    capacity: yup.number().required().min(0),
    isDisabled: yup.boolean().required()
});