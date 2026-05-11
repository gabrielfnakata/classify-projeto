import { useState, useEffect } from "react";
import { format, startOfWeek, addDays, getMonth, getYear, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";

import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/features/metric-card"; 
import { EmptyState } from "@/components/common/empty-state";
import { DailyTimeline, getPastelColorTheme } from "@/components/features/daily-timeline";
import type { TimelineEvent } from "@/components/features/daily-timeline";
import { cn } from "@/lib/utils";

export interface DashboardMetrics {
  pendingReports: number;
  completedClasses: number;
  totalClassesToday: number;
}

interface BaseWidgetProps {
  aulasDoDia: TimelineEvent[];
  aulasDaSemana: TimelineEvent[];
  onClassClick: (aula: TimelineEvent) => void;
}

interface MetricsWidgetProps {
  date: Date;
  mesAtualFormatado: string;
  metrics: DashboardMetrics;
  onMetricClick: (type: string) => void;
}


function ProfessorWeekWidget({ aulasDaSemana, onClassClick }: BaseWidgetProps) {
  const hoje = new Date();
  const inicioDaSemana = startOfWeek(hoje, { locale: ptBR }); 
  const diasDaSemana = Array.from({ length: 6 }).map((_, i) => addDays(inicioDaSemana, i + 1)); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 auto-rows-fr">
      {diasDaSemana.map((diaSemana, index) => {
        const isToday = format(hoje, "yyyy-MM-dd") === format(diaSemana, "yyyy-MM-dd");
        
        const aulasDesteDia = aulasDaSemana.filter(aula => 
          (aula as any).date && isSameDay(new Date((aula as any).date), diaSemana)
        );
        const isEmpty = aulasDesteDia.length === 0; 

        return (
          <div 
            key={index} 
            className={cn(
              "flex flex-col h-full min-h-[140px] p-4 rounded-2xl border transition-all w-full shadow-sm",
              isToday ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "border-border hover:border-border/80",
              isEmpty ? "opacity-75 bg-muted/20" : "bg-card"
            )}
          >
            <h4 className={`font-semibold text-sm capitalize mb-4 text-center ${isToday ? "text-primary" : "text-foreground"}`}>
              {format(diaSemana, "EEEE", { locale: ptBR })}
            </h4>
            
            {!isEmpty ? (
              <div className="space-y-2 flex-1">
                {aulasDesteDia.map((aula) => (
                  <button 
                    key={aula.id}
                    type="button"
                    onClick={() => onClassClick(aula)}
                    className="w-full text-left text-xs p-2.5 rounded-lg bg-secondary text-secondary-foreground border border-border/50 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors truncate"
                  >
                    <span className="font-bold">{aula.startTime}</span> - {aula.title}, {aula.subtitle}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <span className="text-sm text-muted-foreground font-medium italic">Livre</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProfessorMetricsWidget({ mesAtualFormatado, metrics, onMetricClick }: MetricsWidgetProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button onClick={() => onMetricClick("relatorios")} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard 
          title="Você possui" 
          value={metrics.pendingReports.toString()} 
          subtitle="Relatórios pendentes" 
          variant="summary"
          align="center"
        />
      </button>
      <button onClick={() => onMetricClick("aulas")} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard 
          title="Aulas dadas" 
          value={metrics.completedClasses.toString()} 
          subtitle={mesAtualFormatado} 
          variant="summary"
          align="center"
        />
      </button>
    </div>
  );
}

function AdminTodayClassesWidget({ aulasDoDia, onClassClick }: BaseWidgetProps) {
  const minHour = aulasDoDia.length > 0 ? Math.min(...aulasDoDia.map(a => parseInt(a.startTime.split(":")[0]))) : 8;
  const maxHour = aulasDoDia.length > 0 ? Math.max(...aulasDoDia.map(a => parseInt(a.endTime.split(":")[0]) + 1)) : 20;
  
  const startEvenHour = minHour % 2 !== 0 ? minHour - 1 : minHour;
  const endEvenHour = maxHour % 2 !== 0 ? maxHour + 1 : maxHour;

  const dynamicTimeBlocks = [];
  for (let i = startEvenHour; i < endEvenHour; i += 2) {
    dynamicTimeBlocks.push({
      label: `${i.toString().padStart(2, '0')}:00-${(i + 2).toString().padStart(2, '0')}:00`,
      start: i,
      end: i + 2
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 auto-rows-fr">
      {dynamicTimeBlocks.map((block) => {
        const blockAulas = aulasDoDia.filter((aula) => {
          const hour = parseInt(aula.startTime.split(":")[0]);
          return hour >= block.start && hour < block.end;
        });

        const isEmpty = blockAulas.length === 0;

        return (
          <div 
            key={block.label} 
            className={cn(
              "border border-border shadow-sm rounded-2xl p-4 flex flex-col h-full min-h-[140px] w-full transition-all",
              isEmpty ? "opacity-75 bg-muted/20" : "bg-card"
            )}
          >
            <h4 className="font-semibold text-sm text-foreground text-center mb-3">
              {block.label}
            </h4>
            
            <div className="space-y-2 flex-1 flex flex-col">
              {blockAulas.map((aula) => (
                <button 
                  key={aula.id}
                  type="button"
                  onClick={() => onClassClick(aula)}
                  className="w-full text-left text-xs p-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring truncate border border-border/50"
                >
                  <span className="font-bold">{aula.startTime}</span> - {aula.subtitle}, {aula.title}
                </button>
              ))}
              
              {isEmpty && (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-sm text-muted-foreground font-medium italic">Livre</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AdminMetricsWidget({ date, metrics, onMetricClick }: MetricsWidgetProps) {
  const dataFormatada = format(date || new Date(), "EEEE dd/MMM", { locale: ptBR });
  const dataFormatadaCap = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <button onClick={() => onMetricClick("relatorios")} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard 
          title="Existem" 
          value={metrics.pendingReports.toString()} 
          subtitle="relatórios pendentes" 
          variant="summary"
          align="center"
        />
      </button>
      <button onClick={() => onMetricClick("aulas")} className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl hover:opacity-90 transition-opacity">
        <MetricCard 
          title="Aulas totais do dia" 
          value={metrics.totalClassesToday.toString()} 
          subtitle={dataFormatadaCap} 
          variant="summary"
          align="center"
        />
      </button>
    </div>
  );
}

const DASHBOARD_CONFIG = {
  ADMIN: {
    topSectionTitle: "Aulas de hoje",
    TopWidget: AdminTodayClassesWidget,
    middleSectionTitle: "Relatórios e aulas",
    MiddleWidget: AdminMetricsWidget,
    calendarType: "TIMELINE",
  },
  PROFESSOR: {
    topSectionTitle: "Minha semana",
    TopWidget: ProfessorWeekWidget,
    middleSectionTitle: "Relatórios e ganhos",
    MiddleWidget: ProfessorMetricsWidget,
    calendarType: "LIST",
  }
};

export default function Dashboard() {
  const userRole: "ADMIN" | "PROFESSOR" = "ADMIN"; 
  const viewConfig = DASHBOARD_CONFIG[userRole];

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [aulasDoDia, setAulasDoDia] = useState<TimelineEvent[]>([]);
  const [aulasDaSemana, setAulasDaSemana] = useState<TimelineEvent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    pendingReports: 0,
    completedClasses: 0,
    totalClassesToday: 0
  });

  const mesAtual = format(new Date(), "MMMM yyyy", { locale: ptBR });
  const mesAtualFormatado = mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1);

  const [diasComAulas, setDiasComAulas] = useState<Date[]>([]);
  const [diasIndisponiveis, setDiasIndisponiveis] = useState<Date[]>([]);

  useEffect(() => {
    const hoje = new Date();
    const ano = getYear(hoje);
    const mes = getMonth(hoje);

    setDiasComAulas([
      new Date(ano, mes, 4), new Date(ano, mes, 5),
      new Date(ano, mes, 11), new Date(ano, mes, 14),
      new Date(ano, mes, 18), new Date(ano, mes, 19),
      new Date(ano, mes, 25)
    ]);

    setDiasIndisponiveis([
      new Date(ano, mes, 3), new Date(ano, mes, 6),
      new Date(ano, mes, 10), new Date(ano, mes, 13),
      new Date(ano, mes, 17), new Date(ano, mes, 20),
      new Date(ano, mes, 24), new Date(ano, mes, 27)
    ]);

    const inicioSemana = startOfWeek(hoje, { locale: ptBR });
    setAulasDaSemana([
      { id: 'w1', title: "Arthur", subtitle: "Glauco Condo", startTime: "14:00", endTime: "15:00", date: addDays(inicioSemana, 1).toISOString() } as any,
      { id: 'w2', title: "Maria Luisa", subtitle: "Daniel", startTime: "15:00", endTime: "16:00", date: addDays(inicioSemana, 1).toISOString() } as any,
      { id: 'w3', title: "Gabriel Nakata", subtitle: "Larissa Lumy", startTime: "10:00", endTime: "11:00", date: addDays(inicioSemana, 3).toISOString() } as any,
      { id: 'w4', title: "Nicholas", subtitle: "Glauco Condo", startTime: "16:00", endTime: "17:00", date: addDays(inicioSemana, 4).toISOString() } as any,
    ]);

    setMetrics({
      pendingReports: 2,
      completedClasses: 10,
      totalClassesToday: 12
    });
  }, []);

  useEffect(() => {
    if (!date) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const temAula = diasComAulas.some(d => 
        d.getDate() === date.getDate() && d.getMonth() === date.getMonth()
      );
      
      if (temAula) {
        setAulasDoDia([
          { id: 1, startTime: "09:00", endTime: "10:00", title: "Maria Luisa", subtitle: "Glauco Condo" },
          { id: 2, startTime: "11:30", endTime: "12:30", title: "Gabriel Nakata", subtitle: "Larissa Lumy" },
          { id: 3, startTime: "12:00", endTime: "13:00", title: "Nicholas", subtitle: "Daniel" },
          { id: 4, startTime: "12:15", endTime: "13:30", title: "Arthur", subtitle: "Daniel" },
          { id: 5, startTime: "14:00", endTime: "15:00", title: "Maria Luisa", subtitle: "Glauco Condo" },
          { id: 6, startTime: "15:00", endTime: "16:00", title: "Nicholas", subtitle: "Larissa Lumy" },
          { id: 7, startTime: "15:00", endTime: "16:00", title: "Arthur", subtitle: "Gabriel Nakata" },
          { id: 8, startTime: "15:30", endTime: "16:30", title: "Gabriel Nakata", subtitle: "Daniel" },
          { id: 9, startTime: "17:00", endTime: "19:00", title: "Daniel", subtitle: "Glauco Condo" },
        ]);
      } else {
        setAulasDoDia([]);
      }
      setIsLoading(false);
    }, 500);
  }, [date, diasComAulas]);

  const formatarData = (dataBase: Date) => {
    const diaSemana = format(dataBase, "EEEE", { locale: ptBR });
    const dia = format(dataBase, "d");
    const mes = format(dataBase, "MMMM", { locale: ptBR });
    const ano = format(dataBase, "yyyy");

    const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);

    return `${diaSemanaCap}, ${dia} de ${mesCap} de ${ano}`;
  };

  const handleOpenClassModal = (aula: TimelineEvent) => {
    console.log("Class modal triggered:", aula);
  };

  const handleOpenMetricModal = (type: string) => {
    console.log("Metric modal triggered:", type);
  };

  const aulasAgrupadas = aulasDoDia.reduce((acc, aula) => {
    const key = `${aula.startTime}-${aula.endTime}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(aula);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <AppShell>
      <div className="space-y-8 animate-in fade-in-50">
        
        <div>
          <h1 className="text-3xl font-bold text-foreground">Olá, Gabriel Nakata!</h1>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{viewConfig.topSectionTitle}</h2>
          <viewConfig.TopWidget 
            aulasDoDia={aulasDoDia} 
            aulasDaSemana={aulasDaSemana} 
            onClassClick={handleOpenClassModal} 
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">{viewConfig.middleSectionTitle}</h2>
          <viewConfig.MiddleWidget 
            date={date!} 
            mesAtualFormatado={mesAtualFormatado} 
            metrics={metrics}
            onMetricClick={handleOpenMetricModal} 
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Calendário</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            <div className="col-span-1 bg-card border rounded-2xl p-4 flex justify-center shadow-sm overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                locale={ptBR}
                className="rounded-md max-w-full"
                showOutsideDays={false}
                modifiers={{
                  comAulas: diasComAulas,
                  indisponivel: diasIndisponiveis,
                }}
                modifiersClassNames={{
                  comAulas: "bg-primary/40 text-primary-foreground font-medium rounded-md shadow-sm", 
                  indisponivel: "text-muted-foreground/30 opacity-100 font-normal",
                }}
              />
            </div>

            <div className="col-span-1 lg:col-span-2">
              {isLoading ? (
                <div className="bg-card border rounded-2xl p-6 shadow-sm flex justify-center py-20">
                  <p className="text-muted-foreground animate-pulse font-medium">Carregando agendamentos...</p>
                </div>
              ) : aulasDoDia.length === 0 ? (
                <div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col min-h-[400px]">
                  <h3 className="text-xl font-medium mb-6 text-foreground shrink-0">
                    {date ? formatarData(date) : "Selecione uma data"}
                  </h3>
                  <div className="flex-1 flex items-center justify-center">
                    <EmptyState 
                      title="Nenhuma aula agendada" 
                      description="Você não possui compromissos marcados para esta data."
                      action={
                        <Button className="h-11 rounded-xl px-5 text-sm font-semibold mt-4">
                          Agendar nova aula
                        </Button>
                      }
                    />
                  </div>
                </div>
              ) : viewConfig.calendarType === "TIMELINE" ? (
                <DailyTimeline 
                  date={date!} 
                  events={aulasDoDia} 
                  onEventClick={handleOpenClassModal}
                />
              ) : (
                <div className="bg-card border rounded-2xl p-6 shadow-sm min-h-[400px]">
                  <h3 className="text-xl font-medium mb-6 text-foreground">
                    {date ? formatarData(date) : "Selecione uma data"}
                  </h3>
                  <div className="space-y-4">
                    {(Object.entries(aulasAgrupadas) as [string, TimelineEvent[]][]).map(([timeKey, aulasGroup]) => {
                      const firstAula = aulasGroup[0];
                      
                      return (
                        <div key={timeKey} className="flex gap-4 items-start w-full">
                          
                          <div className="w-16 shrink-0 flex flex-col items-center pt-2">
                            <span className="text-sm font-bold text-foreground">{firstAula.startTime}</span>
                            <span className="text-[10px] font-medium text-muted-foreground">{firstAula.endTime}</span>
                          </div>
                          
                          <div className="flex-1 flex flex-row gap-3 overflow-hidden">
                            {aulasGroup.map((aula) => {
                              const colorClasses = getPastelColorTheme(aula.subtitle);
                              
                              return (
                                <button 
                                  key={aula.id} 
                                  type="button"
                                  onClick={() => handleOpenClassModal(aula)}
                                  className={cn(
                                    "flex flex-col justify-center p-3 rounded-xl flex-1 border border-border/20 border-l-4 shadow-sm transition-all overflow-hidden cursor-pointer hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary text-left",
                                    colorClasses
                                  )}
                                >
                                  <p className="text-sm font-bold truncate w-full">{aula.title}</p>
                                  <p className="text-xs opacity-80 mt-0.5 truncate w-full">{aula.subtitle}</p>
                                </button>
                              );
                            })}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        </section>
      </div>
    </AppShell>
  );
}