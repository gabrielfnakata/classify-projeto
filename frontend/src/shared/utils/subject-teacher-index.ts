import type { SubjectTeacherDTO } from "@/shared/dtos/teacher/SubjectTeacherDTO";

const collator = new Intl.Collator("pt-BR", { sensitivity: "base" });

// Índices dos vínculos professor↔disciplina, nos dois sentidos, com nomes já ordenados.
export function teachersBySubject(links: SubjectTeacherDTO[]): Map<string, string[]> {
  return groupNames(links, (link) => link.subject.uuid, (link) => link.employee.name);
}

export function subjectsByTeacher(links: SubjectTeacherDTO[]): Map<string, string[]> {
  return groupNames(links, (link) => link.employee.uuid, (link) => link.subject.description);
}

function groupNames(
  links: SubjectTeacherDTO[],
  keyOf: (link: SubjectTeacherDTO) => string,
  nameOf: (link: SubjectTeacherDTO) => string
): Map<string, string[]> {
  const map = new Map<string, string[]>();

  for (const link of links) {
    const key = keyOf(link);
    const list = map.get(key);
    if (list) list.push(nameOf(link));
    else map.set(key, [nameOf(link)]);
  }

  for (const list of map.values()) list.sort(collator.compare);

  return map;
}
