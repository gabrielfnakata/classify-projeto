import { format, isSameDay, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/shared/types/timeline-event";
import { getEventColorTheme } from "@/shared/utils/event-color-theme";

interface ProfessorWeekProps {
  weeklyClasses: TimelineEvent[];
  date: Date;
}

export function ProfessorWeekWidget({ weeklyClasses = [], date }: ProfessorWeekProps) {
  const todayDate = new Date();
  const weekStart = startOfWeek(date, { locale: ptBR }); 
  const weekDays = Array.from({ length: 6 }).map((_, i) => addDays(weekStart, i + 1)); 

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 auto-rows-fr">
      {weekDays.map((dayOfWeek, index) => {
        const isCurrentDay = format(todayDate, "yyyy-MM-dd") === format(dayOfWeek, "yyyy-MM-dd");
        
        const classesForDay = weeklyClasses.filter(classSession => 
          classSession.date && isSameDay(new Date(classSession.date), dayOfWeek)
        );
        const isEmpty = classesForDay.length === 0; 

        return (
          <div 
            key={index} 
            className={cn(
              "flex flex-col h-full min-h-[140px] p-4 rounded-lg border transition-all w-full shadow-sm",
              isCurrentDay ? "border-primary bg-primary/5 ring-1 ring-primary/50" : "border-border hover:border-border/80",
              isEmpty ? "opacity-75 bg-muted/20" : "bg-card"
            )}
          >
            <h4 className={`font-semibold text-sm capitalize mb-4 text-center ${isCurrentDay ? "text-primary" : "text-foreground"}`}>
              {format(dayOfWeek, "EEEE", { locale: ptBR })}
            </h4>
            
            {!isEmpty ? (
              <div className="space-y-2 flex-1">
                {classesForDay.map((classSession) => {
                  const colorClasses = getEventColorTheme(classSession.subtitle);

                  return (
                    <div 
                      key={classSession.id}
                      className={cn(
                        "w-full text-left text-xs p-2.5 rounded-lg border border-l-4 truncate shadow-sm",
                        colorClasses
                      )}
                    >
                      <span className="font-bold">{classSession.startTime}</span> - {classSession.title}, {classSession.subtitle}
                    </div>
                  );
                })}
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
