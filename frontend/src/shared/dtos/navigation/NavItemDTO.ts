export interface NavSubItemDTO {
  title: string
  url: string | null
}

export interface NavGroupDTO {
  title: string
  items: NavSubItemDTO[]
}
