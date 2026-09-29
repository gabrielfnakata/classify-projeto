export interface FormAnswerDTO {
    uuid: string;
    questionUuid: string;
    optionUuid?: string;
    answerText?: string;
    answerFileUrl?: string;
    teacherFeedback: string;
    correct?: boolean;
}
