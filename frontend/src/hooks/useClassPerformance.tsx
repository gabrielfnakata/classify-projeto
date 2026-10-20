import { useEffect, useMemo, useState } from "react"

import api from "@/services/api"
import type { ClassGroupDTO } from "@/shared/dtos/class-group/ClassGroupDTO"
import type { AttendanceGetDTO } from "@/shared/dtos/attendance/AttendanceGetDTO"
import type { FormDTO } from "@/shared/dtos/form/FormDTO"
import {
  averageScore,
  buildClassGradeTrend,
  buildStudentCountTrend,
  getGradedForms,
  overallAttendanceRate,
  type StudentCountPoint,
} from "@/shared/utils/performance-metrics"

export interface StudentPerformanceRow {
  uuid: string
  name: string
  attendanceRate: number | null
  averageGrade: number | null
}

function average(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

// Nota média e frequência de cada aluno da turma, mais as médias da turma.
export function useClassPerformance(classUuid: string | null) {
  const [rows, setRows] = useState<StudentPerformanceRow[] | null>(null)
  const [gradedFormsByStudent, setGradedFormsByStudent] = useState<FormDTO[][]>([])
  const [history, setHistory] = useState<StudentCountPoint[]>([])

  useEffect(() => {
    if (!classUuid) return
    let cancelled = false
    setRows(null)
    setGradedFormsByStudent([])
    setHistory([])

    api.get<StudentCountPoint[]>(`/class/${classUuid}/history`, { data: {} }).then((response) => {
      if (!cancelled) setHistory(response.data ?? [])
    })

    api.get<ClassGroupDTO>(`/class/${classUuid}`, { data: {} }).then(async (classResponse) => {
      const results = await Promise.all(
        classResponse.data.students.map(async (student) => {
          const [attendanceRes, formsRes] = await Promise.all([
            api.get<AttendanceGetDTO[]>(`/student/${student.uuid}/attendance`, { data: {} }),
            api.get<FormDTO[]>(`/student/${student.uuid}/forms`, { data: {} }),
          ])
          const graded = getGradedForms(formsRes.data ?? [])
          return {
            row: {
              uuid: student.uuid,
              name: student.name,
              attendanceRate: overallAttendanceRate(attendanceRes.data ?? []),
              averageGrade: averageScore(graded),
            },
            graded,
          }
        })
      )
      if (cancelled) return
      setRows(results.map((r) => r.row).sort((a, b) => a.name.localeCompare(b.name)))
      setGradedFormsByStudent(results.map((r) => r.graded))
    })

    return () => {
      cancelled = true
    }
  }, [classUuid])

  const gradeTrend = useMemo(() => buildClassGradeTrend(gradedFormsByStudent), [gradedFormsByStudent])
  const studentCountTrend = useMemo(() => buildStudentCountTrend(history), [history])

  const summary = useMemo(() => {
    const attendance = average((rows ?? []).map((r) => r.attendanceRate).filter((v): v is number => v != null))
    return {
      averageGrade: average((rows ?? []).map((r) => r.averageGrade).filter((v): v is number => v != null)),
      averageAttendance: attendance == null ? null : Math.round(attendance),
    }
  }, [rows])

  return { rows, ...summary, gradeTrend, studentCountTrend }
}
