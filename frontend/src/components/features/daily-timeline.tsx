import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/shared/types/timeline-event";
import { getEventColorTheme } from "@/shared/utils/event-color-theme";

interface DailyTimelineProps {
  date: Date;
  events: TimelineEvent[];
  startHour?: number;
  endHour?: number;
  onEventClick?: (event: TimelineEvent) => void;
}

type TimelineEventWithMinutes = TimelineEvent & {
  startM: number;
  endM: number;
};

type TimelineEventWithColumn = TimelineEventWithMinutes & {
  col: number;
};

type LayoutedTimelineEvent = TimelineEventWithColumn & {
  maxCol: number;
};

const INNER_HEIGHT_PX = 700;
const MIN_EVENT_HEIGHT_PX = 32;

function parseTimeToMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");

  return Number(hour) * 60 + Number(minute);
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function DailyTimeline({
  date,
  events,
  startHour = 8,
  endHour = 19,
  onEventClick,
}: DailyTimelineProps) {
  const minEventHour =
    events.length > 0
      ? Math.min(
          ...events.map((event) =>
            Math.floor(parseTimeToMinutes(event.startTime) / 60)
          )
        )
      : startHour;

  const maxEventHour =
    events.length > 0
      ? Math.max(
          ...events.map((event) => {
            const endMinutes = parseTimeToMinutes(event.endTime);
            const hour = Math.floor(endMinutes / 60);
            const minute = endMinutes % 60;

            return minute > 0 ? hour + 1 : hour;
          })
        )
      : endHour;

  const actualStartHour = Math.min(startHour, minEventHour);
  const actualEndHour = Math.max(endHour, maxEventHour);
  const totalHours = actualEndHour - actualStartHour;

  const pctPerHour = 100 / totalHours;
  const pctPerMinute = pctPerHour / 60;

  const hours = Array.from(
    { length: totalHours + 1 },
    (_, index) => actualStartHour + index
  );

  const getTopPositionPct = (time: string) => {
    const minutes = parseTimeToMinutes(time);
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const hoursFromStart = hour - actualStartHour;

    return hoursFromStart * pctPerHour + minute * pctPerMinute;
  };

  const formattedDate = (baseDate: Date) => {
    const weekDay = format(baseDate, "EEEE", { locale: ptBR });
    const day = format(baseDate, "d");
    const month = format(baseDate, "MMMM", { locale: ptBR });
    const year = format(baseDate, "yyyy");

    return `${capitalize(weekDay)}, ${day} de ${capitalize(month)} de ${year}`;
  };

  const layoutedEvents = useMemo<LayoutedTimelineEvent[]>(() => {
    const eventsWithMinutes: TimelineEventWithMinutes[] = events
      .map((event) => ({
        ...event,
        startM: parseTimeToMinutes(event.startTime),
        endM: parseTimeToMinutes(event.endTime),
      }))
      .sort((firstEvent, secondEvent) => firstEvent.startM - secondEvent.startM);

    const groups: TimelineEventWithMinutes[][] = [];
    let currentGroup: TimelineEventWithMinutes[] = [];
    let groupEnd = 0;

    for (const event of eventsWithMinutes) {
      if (currentGroup.length === 0) {
        currentGroup.push(event);
        groupEnd = event.endM;
      } else if (event.startM < groupEnd) {
        currentGroup.push(event);
        groupEnd = Math.max(groupEnd, event.endM);
      } else {
        groups.push(currentGroup);
        currentGroup = [event];
        groupEnd = event.endM;
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    const finalLayout: LayoutedTimelineEvent[] = [];

    for (const group of groups) {
      const columns: number[] = [];
      const eventsWithColumns: TimelineEventWithColumn[] = [];

      for (const event of group) {
        const availableColumnIndex = columns.findIndex(
          (columnEnd) => columnEnd <= event.startM
        );

        if (availableColumnIndex >= 0) {
          columns[availableColumnIndex] = event.endM;

          eventsWithColumns.push({
            ...event,
            col: availableColumnIndex,
          });
        } else {
          const newColumnIndex = columns.length;

          columns.push(event.endM);

          eventsWithColumns.push({
            ...event,
            col: newColumnIndex,
          });
        }
      }

      const maxCol = columns.length;

      finalLayout.push(
        ...eventsWithColumns.map((event) => ({
          ...event,
          maxCol,
        }))
      );
    }

    return finalLayout;
  }, [events]);

  return (
    <div className="flex flex-col w-full bg-card rounded-2xl border p-6 shadow-sm">
      <h3 className="text-xl font-medium text-foreground mb-6 shrink-0">
        {formattedDate(date)}
      </h3>

      <div
        className="flex relative w-full mt-2"
        style={{ height: `${INNER_HEIGHT_PX}px` }}
      >
        <div className="w-14 shrink-0 relative select-none">
          {hours.map((hour) => (
            <div
              key={hour}
              className="absolute w-full text-xs font-medium text-muted-foreground text-right pr-3"
              style={{
                top: `${(hour - actualStartHour) * pctPerHour}%`,
                transform: "translateY(-50%)",
              }}
            >
              <span className="bg-card px-1">
                {hour.toString().padStart(2, "0")}:00
              </span>
            </div>
          ))}
        </div>

        <div className="flex-1 relative border-l border-border/60 pl-2">
          {hours.map((hour) => (
            <div
              key={`line-${hour}`}
              className="absolute w-full border-t border-border/40 left-0"
              style={{
                top: `${(hour - actualStartHour) * pctPerHour}%`,
              }}
            />
          ))}

          {layoutedEvents.map((event) => {
            const topPct = getTopPositionPct(event.startTime);
            const bottomPct = getTopPositionPct(event.endTime);
            const heightPct = bottomPct - topPct;

            const heightPx = Math.max(
              (heightPct / 100) * INNER_HEIGHT_PX,
              MIN_EVENT_HEIGHT_PX
            );

            const adjustedHeightPct = (heightPx / INNER_HEIGHT_PX) * 100;

            const isUltraCompact = heightPx < 45;
            const isCompact = heightPx >= 45 && heightPx < 65;

            const widthPct = 100 / event.maxCol;
            const leftPct = widthPct * event.col;
            const colorClasses = getEventColorTheme(event.subtitle);

            const durationMins = event.endM - event.startM;
            const baseZIndex = 2000 - durationMins;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick?.(event)}
                className={cn(
                  "absolute flex border-l-4 shadow-sm transition-all overflow-hidden text-left cursor-pointer",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 border-t border-r border-b hover:brightness-95",
                  colorClasses,
                  isUltraCompact
                    ? "px-1.5 py-0 flex-row items-center gap-1.5"
                    : "px-2 py-1 flex-col justify-start"
                )}
                style={{
                  top: `calc(${topPct}% + 1px)`,
                  height: `calc(${adjustedHeightPct}% - 2px)`,
                  left: `calc(${leftPct}% + 2px)`,
                  width: `calc(${widthPct}% - 6px)`,
                  zIndex: baseZIndex,
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
                      <span className="text-[11px] font-bold truncate shrink">
                        {event.title}
                      </span>
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
