import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface IconActionProps {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
  className?: string;
}

/** Botão só de ícone: o que ele faz aparece no tooltip e para leitores de tela. */
export function IconAction({
  label,
  icon,
  onClick,
  disabled = false,
  variant = "outline",
  className,
}: IconActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon-sm"
          variant={variant}
          disabled={disabled}
          aria-label={label}
          onClick={onClick}
          className={className}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
