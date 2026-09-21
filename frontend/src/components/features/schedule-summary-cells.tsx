import { StatusBadge } from "@/components/features/status-badge";
import type { ScheduleSummary } from "@/hooks/useScheduleSummary";

export function UpcomingSessionsBadge({ summary }: { summary?: ScheduleSummary }) {
  if (!summary || summary.upcoming === 0) {
    return <StatusBadge variant="muted">Sem aulas</StatusBadge>;
  }

  return (
    <StatusBadge variant="success">
      {summary.upcoming} agendada{summary.upcoming > 1 ? "s" : ""}
    </StatusBadge>
  );
}

export function NamesCell({ names, emptyText = "—" }: { names?: string[]; emptyText?: string }) {
  if (!names || names.length === 0) return <span className="text-muted-foreground">{emptyText}</span>;

  const [first, second, ...rest] = names;
  const shown = [first, second].filter(Boolean).join(", ");

  return (
    <span title={names.join(", ")}>
      {shown}
      {rest.length > 0 && <span className="text-muted-foreground"> +{rest.length}</span>}
    </span>
  );
}
