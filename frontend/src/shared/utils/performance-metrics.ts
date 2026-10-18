import type { AttendanceGetDTO } from "@/shared/dtos/attendance/AttendanceGetDTO"
import type { ClassSessionDTO } from "@/shared/dtos/class-session/ClassSessionDTO"
import type { FormDTO } from "@/shared/dtos/form/FormDTO"
import type { CategoryDatum, TrendPoint } from "./session-analytics"
import { formatDateLabel, formatShortDate, toDate } from "./date-formatter"

// Notas: só formulários já corrigidos e com nota têm valor real para o aluno.

export function getGradedForms(forms: FormDTO[]): FormDTO[] {
  return forms.filter((form) => form.status === "CORRECTED" && form.score != null)
}

export function averageScore(gradedForms: FormDTO[]): number | null {
  if (gradedForms.length === 0) return null
  const sum = gradedForms.reduce((acc, form) => acc + (form.score as number), 0)
  return sum / gradedForms.length
}

export function buildGradeEvolution(gradedForms: FormDTO[]): TrendPoint[] {
  return gradedForms
    .slice()
    .sort((a, b) => toDate(a.limitDate).getTime() - toDate(b.limitDate).getTime())
    .map((form) => {
      const date = toDate(form.limitDate)
      return {
        label: formatShortDate(date),
        fullLabel: `${form.title} — ${formatDateLabel(date)}`,
        value: form.score as number,
      }
    })
}

// Média da turma em cada avaliação. Cada aluno recebe a sua submissão do mesmo formulário,
// então a avaliação é identificada por título + data limite.
export function buildClassGradeTrend(gradedFormsByStudent: FormDTO[][]): TrendPoint[] {
  const byAssessment = new Map<string, { title: string; limitDate: string; scores: number[] }>()

  gradedFormsByStudent.flat().forEach((form) => {
    const key = `${form.title}|${form.limitDate}`
    const entry = byAssessment.get(key) ?? { title: form.title, limitDate: form.limitDate, scores: [] }
    entry.scores.push(form.score as number)
    byAssessment.set(key, entry)
  })

  return Array.from(byAssessment.values())
    .sort((a, b) => toDate(a.limitDate).getTime() - toDate(b.limitDate).getTime())
    .map(({ title, limitDate, scores }) => {
      const date = toDate(limitDate)
      return {
        label: formatShortDate(date),
        fullLabel: `${title} — ${formatDateLabel(date)} (${scores.length} alunos)`,
        value: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
      }
    })
}

export interface StudentCountPoint {
  date: string
  studentCount: number
}

// Uma posição por dia, do primeiro registro até hoje, repetindo a última contagem conhecida:
// assim o eixo X é proporcional ao tempo e cada entrada/saída aparece como um degrau.
export function buildStudentCountTrend(history: StudentCountPoint[]): TrendPoint[] {
  if (history.length === 0) return []

  const sorted = history.slice().sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime())
  const day = toDate(sorted[0].date)
  day.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const points: TrendPoint[] = []
  let index = 0
  let current = 0
  while (day <= today) {
    const endOfDay = new Date(day)
    endOfDay.setHours(23, 59, 59, 999)
    while (index < sorted.length && toDate(sorted[index].date) <= endOfDay) {
      current = sorted[index].studentCount
      index++
    }
    points.push({ label: formatShortDate(day), fullLabel: formatDateLabel(day), value: current })
    day.setDate(day.getDate() + 1)
  }

  return points
}

// Frequência por disciplina: junta os registros de presença com a sessão de aula
// correspondente para saber a qual disciplina ela pertence.

export function buildAttendanceBySubject(
  attendance: AttendanceGetDTO[],
  sessions: ClassSessionDTO[]
): CategoryDatum[] {
  const subjectBySessionUuid = new Map(sessions.map((s) => [s.uuid, s.subjectTeacher.subject.description]))

  const totals = new Map<string, { present: number; total: number }>()
  attendance.forEach((record) => {
    const subject = subjectBySessionUuid.get(record.classSessionUuid)
    if (!subject) return

    const entry = totals.get(subject) ?? { present: 0, total: 0 }
    entry.total += 1
    if (record.status === "PRESENTE") entry.present += 1
    totals.set(subject, entry)
  })

  return Array.from(totals.entries()).map(([label, { present, total }]) => ({
    label,
    value: total === 0 ? 0 : Math.round((present / total) * 100),
  }))
}

export function overallAttendanceRate(attendance: AttendanceGetDTO[]): number | null {
  if (attendance.length === 0) return null
  const present = attendance.filter((record) => record.status === "PRESENTE").length
  return Math.round((present / attendance.length) * 100)
}
