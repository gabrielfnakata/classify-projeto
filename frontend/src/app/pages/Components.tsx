import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

import { AppShell } from "@/components/layout/app-shell"
import { ContentCard } from "@/components/layout/content-card"
import { PageHeader } from "@/components/layout/page-header"

import { Avatar } from "@/components/common/avatar"
import { DataTable, type DataTableColumn } from "@/components/common/data-table"
import { EmptyState } from "@/components/common/empty-state"
import { FormField } from "@/components/common/form-field"
import { SelectField } from "@/components/common/select-field"
import { ThemeToggle } from "@/components/common/theme-toggle"

import { EntityCard } from "@/components/features/entity-card"
import { FilterBar, FilterSelect } from "@/components/features/filter-bar"
import { FormGrid } from "@/components/features/form-grid"
import { MetricCard } from "@/components/features/metric-card"
import { PageActions } from "@/components/features/page-actions"
import { SearchInput } from "@/components/features/search-input"
import { SectionTitle } from "@/components/features/section-title"
import {
  SegmentedTabs,
  type SegmentedTabOption,
} from "@/components/features/segmented-tabs"
import { StatusBadge } from "@/components/features/status-badge"

type Student = {
  id: number
  name: string
  registration: string
  modality: "Aula Particular" | "Turma"
  course: "Matemática" | "Inglês" | "Desenho"
  status: "ativo" | "pendente" | "cancelado"
  email: string
}

const studentsMock: Student[] = [
  {
    id: 1,
    name: "Glauco Condo",
    registration: "11111111",
    modality: "Aula Particular",
    course: "Matemática",
    status: "ativo",
    email: "glauco@email.com",
  },
  {
    id: 2,
    name: "Gabriel Nakata",
    registration: "11111112",
    modality: "Turma",
    course: "Inglês",
    status: "pendente",
    email: "gabriel@email.com",
  },
  {
    id: 3,
    name: "Maria Luisa de Aquino Vicente",
    registration: "11111113",
    modality: "Turma",
    course: "Desenho",
    status: "cancelado",
    email: "eu@email.com",
  },
]

const tabOptions: SegmentedTabOption[] = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ativos" },
  { label: "Pendentes", value: "pendentes" },
]

function getStatusBadgeVariant(status: Student["status"]) {
  if (status === "ativo") return "success"
  if (status === "pendente") return "warning"
  return "danger"
}

export default function Components() {
  const [selectedTab, setSelectedTab] = useState("todos")

  const [search, setSearch] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [modalityFilter, setModalityFilter] = useState("")

  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [studentPhone, setStudentPhone] = useState("")
  const [studentCourse, setStudentCourse] = useState("")
  const [studentNotes, setStudentNotes] = useState("")

  const filteredStudents = useMemo(() => {
    return studentsMock.filter((student) => {
      const matchesSearch =
        !search ||
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.registration.includes(search)

      const matchesCourse =
        !courseFilter || student.course.toLowerCase() === courseFilter

      const matchesModality =
        !modalityFilter || student.modality.toLowerCase() === modalityFilter

      const matchesTab =
        selectedTab === "todos" ||
        (selectedTab === "ativos" && student.status === "ativo") ||
        (selectedTab === "pendentes" && student.status === "pendente")

      return (
        matchesSearch && matchesCourse && matchesModality && matchesTab
      )
    })
  }, [search, courseFilter, modalityFilter, selectedTab])

  const tableColumns: DataTableColumn<Student>[] = [
    {
      key: "student",
      header: "Aluno",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} seed={row.id} size="md" />
          <div>
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">
              Matrícula: {row.registration}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      header: "Curso",
      cell: (row) => row.course,
    },
    {
      key: "modality",
      header: "Modalidade",
      cell: (row) => row.modality,
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <StatusBadge variant={getStatusBadgeVariant(row.status)}>
          {row.status === "ativo"
            ? "Ativo"
            : row.status === "pendente"
              ? "Pendente"
              : "Cancelado"}
        </StatusBadge>
      ),
    },
  ]

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Demonstração de componentes"
          description="Página de exemplo usando os componentes das pastas common, layout e features."
          action={
            <Button className="h-11 rounded-xl px-5 text-sm font-semibold">
              Botão Grande
            </Button>
          }
        />

        <ContentCard>
          <SectionTitle
            title="Metric Cards"
            description="Exemplo de cards de indicadores em resumo e detalhados."
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              variant="summary"
              value="66%"
              subtitle="ta bom"
              tone="success"
            />
            <MetricCard
              variant="summary"
              value="33%"
              subtitle="ta mais ou menos"
              tone="warning"
            />
            <MetricCard
              variant="summary"
              value="11%"
              subtitle="ta ruim"
              tone="danger"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <MetricCard
              title="Lucro"
              value="$3333,33"
              subtitle="vs. last month"
              trendValue="+12.6%"
              trendDirection="up"
              statusLabel="Esperado"
              tone="success"
              tooltipText="texto explicando algo"
            />

            <MetricCard
              title="Alunos"
              value="150"
              subtitle="vs. last month"
              trendValue="+8.3%"
              trendDirection="up"
              statusLabel="Esperado"
              tone="success"
              tooltipText="texto explicando algo"
            />

            <MetricCard
              title="Taxa"
              value="13.0%"
              subtitle="vs. last month"
              trendValue="-0.8%"
              trendDirection="down"
              statusLabel="Na média"
              tone="warning"
              tooltipText="texto explicando algo"
            />
          </div>
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Componentes básicos"
            description="Exemplo de Avatar, ThemeToggle e StatusBadge."
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar name="Glauco Condo" seed={1} size="sm" />
              <Avatar name="Glauco Condo" seed={1} size="md" />
              <Avatar name="Glauco Condo" seed={1} size="lg" />
              <Avatar name="Gabriel Nakata" seed={2} size="xl" />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge>Default</StatusBadge>
              <StatusBadge variant="success">Ativo</StatusBadge>
              <StatusBadge variant="warning">Pendente</StatusBadge>
              <StatusBadge variant="danger">Cancelado</StatusBadge>
              <StatusBadge variant="info">Em análise</StatusBadge>
              <StatusBadge variant="muted">Rascunho</StatusBadge>
            </div>

            <div className="w-full max-w-[220px]">
              <ThemeToggle />
            </div>
          </div>
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Busca, filtros e tabs"
            description="Exemplo de SearchInput, FilterBar, FilterSelect e SegmentedTabs."
          />

          <div className="space-y-4">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nome ou matrícula..."
              className="max-w-xl"
            />

            <SegmentedTabs
              options={tabOptions}
              value={selectedTab}
              onChange={setSelectedTab}
            />

            <FilterBar
              searchValue={search}
              onSearchChange={setSearch}
              searchPlaceholder="Nome do aluno"
              leftExtra={
                <FilterSelect
                  value={courseFilter}
                  onChange={setCourseFilter}
                  placeholder="Filtrar por curso"
                  options={[
                    { label: "Matemática", value: "matemática" },
                    { label: "Inglês", value: "inglês" },
                    { label: "Desenho", value: "desenho" },
                  ]}
                />
              }
              rightExtra={
                <FilterSelect
                  value={modalityFilter}
                  onChange={setModalityFilter}
                  placeholder="Filtrar por modalidade"
                  options={[
                    { label: "Aula Particular", value: "aula particular" },
                    { label: "Turma", value: "turma" },
                  ]}
                />
              }
            />
          </div>
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Formulário"
            description="Exemplo de FormField, FormGrid, SelectField e PageActions."
          />

          <FormGrid>
            <div className="md:col-span-2">
              <FormField label="Nome do aluno" htmlFor="student-name" required>
                <input
                  id="student-name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Maria da Silva"
                  className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </FormField>
            </div>

            <FormField label="E-mail" htmlFor="student-email">
              <input
                id="student-email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Ex: aluno@email.com"
                className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </FormField>

            <FormField label="Telefone" htmlFor="student-phone">
              <input
                id="student-phone"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                placeholder="Ex: (11) 91234-5678"
                className="w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </FormField>

            <FormField label="Curso">
              <SelectField
                value={studentCourse}
                onChange={setStudentCourse}
                placeholder="Selecione o curso"
                options={[
                  { label: "Matemática", value: "matematica" },
                  { label: "Inglês", value: "ingles" },
                  { label: "Desenho", value: "desenho" },
                ]}
              />
            </FormField>

            <div className="md:col-span-2">
              <FormField
                label="Observações"
                htmlFor="student-notes"
                hint="Campo opcional."
              >
                <textarea
                  id="student-notes"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="Digite observações sobre o aluno..."
                  className="min-h-28 w-full rounded-xl border border-border bg-filter-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </FormField>
            </div>
          </FormGrid>

          <PageActions>
            <Button
              variant="outline"
              className="h-11 rounded-xl px-5 text-sm font-semibold"
            >
              Cancelar
            </Button>
            <Button className="h-11 rounded-xl px-5 text-sm font-semibold">
              Salvar
            </Button>
          </PageActions>
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Cards de entidade"
            description="Exemplo de EntityCard com dados filtrados."
            action={
              <StatusBadge variant="info">
                {filteredStudents.length} resultado(s)
              </StatusBadge>
            }
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {filteredStudents.slice(0, 4).map((student) => (
              <EntityCard
                key={student.id}
                name={student.name}
                seed={student.id}
                subtitle={`Matrícula: ${student.registration}`}
                description={`${student.modality}, ${student.course}`}
              />
            ))}
          </div>

          <PageActions>
            <Button className="h-11 rounded-xl px-5 text-sm font-semibold">
              Criar registro
            </Button>
          </PageActions>
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Tabela"
            description="Exemplo do DataTable com os mesmos dados."
          />

          <DataTable
            data={filteredStudents}
            columns={tableColumns}
            rowKey={(row) => row.id}
            emptyMessage="Nenhum aluno encontrado com os filtros atuais."
          />
        </ContentCard>

        <ContentCard>
          <SectionTitle
            title="Estado vazio"
            description="Exemplo de EmptyState."
          />

          <EmptyState
            title="Nenhum relatório encontrado"
            description="Quando não houver itens para exibir, este componente pode ser usado para evitar telas vazias."
            action={
              <Button className="h-11 rounded-xl px-5 text-sm font-semibold">
                Criar relatório
              </Button>
            }
          />
        </ContentCard>
      </div>
    </AppShell>
  )
}
