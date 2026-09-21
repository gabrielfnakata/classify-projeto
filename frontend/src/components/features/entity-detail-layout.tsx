import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Check, Loader2, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EntityDetailLayoutProps {
  title: string;
  description?: string;
  badge?: ReactNode;
  backTo: string;
  loading?: boolean;
  editing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  children: ReactNode;
}

export function EntityDetailLayout({
  title,
  description,
  badge,
  backTo,
  loading = false,
  editing = false,
  onEditingChange,
  children,
}: EntityDetailLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
      <div className="mb-4 flex flex-col gap-3 md:min-h-[3.25rem] md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            {badge}
          </div>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" onClick={() => navigate(backTo)}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          {onEditingChange &&
            (editing ? (
              <Button onClick={() => onEditingChange(false)}>
                <Check className="h-4 w-4" />
                Concluir
              </Button>
            ) : (
              <Button variant="outline" title="Editar vínculos" onClick={() => onEditingChange(true)}>
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}
