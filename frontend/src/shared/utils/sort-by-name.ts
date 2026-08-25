
const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true })

export function compareByName(a: { name: string }, b: { name: string }): number {
  return collator.compare(a.name, b.name)
}

export function sortedByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort(compareByName)
}
