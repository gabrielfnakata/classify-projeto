export interface FormAnswerDTO {
    uuid: string;
    questionUuid: string;
    optionUuid?: string;
    answerText?: string;
    teacherFeedback: string;
}
