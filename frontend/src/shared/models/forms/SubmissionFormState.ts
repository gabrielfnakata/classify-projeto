export interface UploadedAnswerFile {
    uuid: string;
    fileName: string;
    size: number;
    status: "uploading" | "done" | "error";
    error?: string;
}

export interface QuestionAnswerValue {
    answerText: string;
    optionUuid: string;
    optionUuids: string[];
    files: UploadedAnswerFile[];
}

export interface AnswerFormValues {
    answers: QuestionAnswerValue[];
}

export const emptyAnswer = (): QuestionAnswerValue => ({
    answerText: "",
    optionUuid: "",
    optionUuids: [],
    files: []
});
