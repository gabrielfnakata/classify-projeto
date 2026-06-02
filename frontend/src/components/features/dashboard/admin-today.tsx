import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/shared/types/timeline-event";
import { getEventColorTheme } from "@/shared/utils/event-color-theme";

interface AdminTodayProps {
  dailyClasses: TimelineEvent[];
}

export function AdminTodayClassesWidget({ dailyClasses = [] }: AdminTodayProps) {
  const minHour = dailyClasses.length > 0 ? Math.min(...dailyClasses.map(a => parseInt(a.startTime.split(":")[0]))) : 8;
  const maxHour = dailyClasses.length > 0 ? Math.max(...dailyClasses.map(a => parseInt(a.endTime.split(":")[0]) + 1)) : 20;
  
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
        const blockClasses = dailyClasses.filter((classSession) => {
          const hour = parseInt(classSession.startTime.split(":")[0]);
          return hour >= block.start && hour < block.end;
        });

        const isEmpty = blockClasses.length === 0;

        return (
          <div 
            key={block.label} 
            className={cn(
              "border border-border shadow-sm rounded-lg p-4 flex flex-col h-full min-h-[140px] w-full transition-all",
              isEmpty ? "opacity-75 bg-muted/20" : "bg-card"
            )}
          >
            <h4 className="font-semibold text-sm text-foreground text-center mb-3">
              {block.label}
            </h4>
            
            <div className="space-y-2 flex-1 flex flex-col">
              {blockClasses.map((classSession) => {
                const colorClasses = getEventColorTheme(classSession.subtitle);

                return (
                  <div 
                    key={classSession.id}
                    className={cn(
                      "w-full text-left text-xs p-2 rounded-lg border border-l-4 truncate",
                      colorClasses
                    )}
                  >
                    <span className="font-bold">{classSession.startTime}</span> - {classSession.subtitle}, {classSession.title}
                  </div>
                );
              })}
              
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
