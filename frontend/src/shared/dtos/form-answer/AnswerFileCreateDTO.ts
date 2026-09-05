export interface AnswerFileCreateDTO {
    uuid?: string;
    bucket: string;
    uploadUrl: string;
    file: File;
}
