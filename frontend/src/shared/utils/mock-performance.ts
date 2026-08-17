// Dados fictícios para ilustrar como um gráfico de desempenho ficaria.
// A API ainda não expõe endpoints de avaliação (Assessment) nem de presença,
// então estes valores são gerados de forma determinística a partir do nome
// da disciplina — não vêm de nenhum registro real do aluno.

import { formatDateLabel, formatShortDate } from "./date-formatter"

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function mockGrade(subject: string): number {
  const spread = hashString(subject) % 41 // 0-40
  return Math.round((6 + (spread / 40) * 4) * 10) / 10 // 6.0 - 10.0
}

export function mockAttendance(subject: string): number {
  const spread = hashString(`${subject}-freq`) % 31 // 0-30
  return 70 + spread // 70% - 100%
}

export interface GradeEvolutionPoint {
  label: string
  fullLabel: string
  value: number
}

// Gera uma "evolução" fictícia: parte de uma nota mais baixa e converge pra
// nota final determinística (mockGrade), com uma leve variação por ponto —
// só pra dar a sensação de tendência, não é extrapolado de nenhuma avaliação real.
export function mockGradeEvolution(subject: string, days: number, points = 5): GradeEvolutionPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setDate(start.getDate() - (days - 1))

  const finalGrade = mockGrade(subject)
  const startGrade = Math.max(4, finalGrade - 2.5)

  return Array.from({ length: points }, (_, i) => {
    const t = points === 1 ? 1 : i / (points - 1)
    const date = new Date(start)
    date.setDate(date.getDate() + Math.round(t * (days - 1)))

    const jitter = ((hashString(`${subject}-eval-${i}`) % 11) - 5) / 10 // -0.5 .. +0.5
    const raw = startGrade + t * (finalGrade - startGrade) + jitter
    const value = Math.min(10, Math.max(0, Math.round(raw * 10) / 10))

    return {
      label: formatShortDate(date),
      fullLabel: formatDateLabel(date),
      value,
    }
  })
}
