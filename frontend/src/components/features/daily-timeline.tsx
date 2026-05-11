import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface TimelineEvent {
  id: string | number;
  startTime: string; 
  endTime: string;   
  title: string;     
  subtitle: string;  
}

interface DailyTimelineProps {
  date: Date;
  events: TimelineEvent[];
  startHour?: number;
  endHour?: number;
  onEventClick?: (event: TimelineEvent) => void;
}

export const getPastelColorTheme = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 6; 
  
  const pastelThemes = [
    "bg-blue-50/70 border-blue-100 border-l-blue-300 text-blue-800 dark:bg-blue-900/10 dark:border-blue-900/30 dark:border-l-blue-600 dark:text-blue-200",
    "bg-emerald-50/70 border-emerald-100 border-l-emerald-300 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:border-l-emerald-600 dark:text-emerald-200",
    "bg-yellow-50/80 border-yellow-200 border-l-yellow-400 text-yellow-800 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:border-l-yellow-600 dark:text-yellow-200",
    "bg-violet-50/70 border-violet-100 border-l-violet-300 text-violet-800 dark:bg-violet-900/10 dark:border-violet-900/30 dark:border-l-violet-600 dark:text-violet-200",
    "bg-purple-50/70 border-purple-100 border-l-purple-300 text-purple-800 dark:bg-purple-900/10 dark:border-purple-900/30 dark:border-l-purple-600 dark:text-purple-200",
    "bg-rose-50/70 border-rose-100 border-l-rose-300 text-rose-800 dark:bg-rose-900/10 dark:border-rose-900/30 dark:border-l-rose-600 dark:text-rose-200",
  ];

  return pastelThemes[index];
};

export function DailyTimeline({
  date,
  events,
  startHour = 8, 
  endHour = 19,
  onEventClick,
}: DailyTimelineProps) {
  
  const minEventHour = events.length > 0
    ? Math.min(...events.map(e => parseInt(e.startTime.split(":")[0])))
    : startHour;

  const maxEventHour = events.length > 0
    ? Math.max(...events.map(e => {
        const [h, m] = e.endTime.split(":").map(Number);
        return m > 0 ? h + 1 : h; 
      }))
    : endHour;

  const actualStartHour = Math.min(startHour, minEventHour);
  const actualEndHour = Math.max(endHour, maxEventHour);
  const totalHours = actualEndHour - actualStartHour;

  const PCT_PER_HOUR = 100 / totalHours; 
  const PCT_PER_MINUTE = PCT_PER_HOUR / 60;
  
  const INNER_HEIGHT_PX = 500; 

  const hours = Array.from(
    { length: totalHours + 1 },
    (_, i) => actualStartHour + i
  );

  const getTopPositionPct = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const hoursFromStart = h - actualStartHour;
    return hoursFromStart * PCT_PER_HOUR + m * PCT_PER_MINUTE;
  };

  const formatarData = (dataBase: Date) => {
    const diaSemana = format(dataBase, "EEEE", { locale: ptBR });
    const dia = format(dataBase, "d");
    const mes = format(dataBase, "MMMM", { locale: ptBR });
    const ano = format(dataBase, "yyyy");

    const diaSemanaCap = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const mesCap = mes.charAt(0).toUpperCase() + mes.slice(1);

    return `${diaSemanaCap}, ${dia} de ${mesCap} de ${ano}`;
  };

  const layoutedEvents = useMemo(() => {
    const parseTime = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const evts = events
      .map((e) => ({ ...e, startM: parseTime(e.startTime), endM: parseTime(e.endTime) }))
      .sort((a, b) => a.startM - b.startM);

    const groups: (typeof evts)[] = [];
    let currentGroup: typeof evts = [];
    let groupEnd = 0;

    for (const e of evts) {
      if (currentGroup.length === 0) {
        currentGroup.push(e);
        groupEnd = e.endM;
      } else if (e.startM < groupEnd) {
        currentGroup.push(e);
        groupEnd = Math.max(groupEnd, e.endM);
      } else {
        groups.push(currentGroup);
        currentGroup = [e];
        groupEnd = e.endM;
      }
    }
    if (currentGroup.length > 0) groups.push(currentGroup);

    const finalLayout: (typeof evts[0] & { col: number; maxCol: number })[] = [];

    for (const group of groups) {
      const columns: number[] = []; 
      for (const e of group) {
        let placed = false;
        for (let i = 0; i < columns.length; i++) {
          if (columns[i] <= e.startM) { 
            (e as any).col = i;
            columns[i] = e.endM;
            placed = true;
            break;
          }
        }
        if (!placed) {
          (e as any).col = columns.length;
          columns.push(e.endM);
        }
      }
      for (const e of group) {
        (e as any).maxCol = columns.length;
        finalLayout.push(e as any);
      }
    }

    return finalLayout;
  }, [events]);

  return (
    <div className="flex flex-col w-full bg-card rounded-2xl border p-6 shadow-sm">
      <h3 className="text-xl font-medium text-foreground mb-6 shrink-0">
        {formatarData(date)}
      </h3>

      <div className="flex relative w-full mt-2" style={{ height: `${INNER_HEIGHT_PX}px` }}>
        
        <div className="w-14 shrink-0 relative select-none">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-xs font-medium text-muted-foreground text-right pr-3"
              style={{ 
                top: `${(hour - actualStartHour) * PCT_PER_HOUR}%`,
                transform: 'translateY(-50%)' 
              }} 
            >
              <span className="bg-card px-1">{hour.toString().padStart(2, "0")}:00</span>
            </div>
          ))}
        </div>

        <div className="flex-1 relative border-l border-border/60 pl-2">
          
          {hours.map((hour) => (
            <div 
              key={`line-${hour}`} 
              className="absolute w-full border-t border-border/40 left-0"
              style={{ top: `${(hour - actualStartHour) * PCT_PER_HOUR}%` }} 
            />
          ))}

          {layoutedEvents.map((event) => {
            const topPct = getTopPositionPct(event.startTime);
            const bottomPct = getTopPositionPct(event.endTime);
            const heightPct = bottomPct - topPct;

            const heightPx = (heightPct / 100) * INNER_HEIGHT_PX;
            
            const isUltraCompact = heightPx < 35;
            const isCompact = heightPx >= 35 && heightPx < 55;

            const widthPct = 100 / event.maxCol;
            const leftPct = widthPct * event.col;
            const colorClasses = getPastelColorTheme(event.subtitle);

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick?.(event)}
                className={cn(
                  "absolute flex border-l-4 shadow-sm transition-all overflow-hidden z-10 hover:z-20 text-left cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 border-t border-r border-b",
                  colorClasses, 
                  isUltraCompact ? "px-1.5 py-0 flex-row items-center gap-1.5" : "px-2 py-1 flex-col justify-start"
                )}
                style={{
                  top: `calc(${topPct}% + 1px)`, 
                  height: `calc(${heightPct}% - 2px)`, 
                  left: `calc(${leftPct}% + 2px)`, 
                  width: `calc(${widthPct}% - 6px)`, 
                }}
              >
                {isUltraCompact && (
                  <>
                    <span className="text-[10px] font-bold opacity-80 shrink-0">
                      {event.startTime}
                    </span>
                    <span className="text-[10px] font-bold truncate shrink">
                      {event.title}
                    </span>
                    <span className="text-[10px] truncate opacity-80 shrink min-w-0">
                      • {event.subtitle}
                    </span>
                  </>
                )}

                {isCompact && (
                  <>
                    <span className="text-[9px] font-semibold opacity-90 truncate leading-none mb-0.5 mt-0.5">
                      {event.startTime} - {event.endTime}
                    </span>
                    <div className="flex items-center gap-1.5 w-full leading-tight overflow-hidden">
                      <span className="text-[11px] font-bold truncate shrink">{event.title}</span>
                      <span className="text-[9px] truncate opacity-80 shrink min-w-0">
                        {event.subtitle}
                      </span>
                    </div>
                  </>
                )}

                {!isUltraCompact && !isCompact && (
                  <>
                    <span className="text-[10px] font-semibold opacity-90 truncate leading-tight mt-0.5 mb-0.5">
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className="text-xs font-bold truncate leading-tight mb-0.5">
                      {event.title}
                    </span>
                    <span className="text-[10px] truncate opacity-80 leading-tight">
                      {event.subtitle}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}