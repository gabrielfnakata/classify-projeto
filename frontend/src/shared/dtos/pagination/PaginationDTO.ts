export interface PaginationDTO<DTO> {
    content: DTO[],
    page: number,
    size: number,
    totalElements: number,
    totalPages: number,
    first: boolean,
    last: boolean
}