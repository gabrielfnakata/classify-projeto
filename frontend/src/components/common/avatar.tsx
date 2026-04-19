import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  name: string;
  seed?: string | number;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const colorClasses = [
  "bg-red-100 text-red-700",
  "bg-orange-100 text-orange-700",
  "bg-amber-100 text-amber-700",
  "bg-yellow-100 text-yellow-700",
  "bg-lime-100 text-lime-700",
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-cyan-100 text-cyan-700",
  "bg-sky-100 text-sky-700",
  "bg-blue-100 text-blue-700",
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700",
];

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function getColorIndex(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return Math.abs(hash) % colorClasses.length;
}

export function Avatar({
  name,
  seed,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const initials = getInitials(name);
  const baseValue = String(seed ?? name);
  const colorClass = colorClasses[getColorIndex(baseValue)];

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold select-none",
        sizeClasses[size],
        colorClass,
        className
      )}
      aria-label={name}
      title={name}
      {...props}
    >
      {initials}
    </div>
  );
}