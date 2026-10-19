import type { ReactNode } from "react";

import { SectionTitle } from "@/components/features/section-title";
import { EntityCard } from "@/components/features/entity-card";
import { LinkedEntityPicker, type PickerOption } from "@/components/features/linked-entity-picker";
import { EmptyState } from "@/components/common/empty-state";
import { ContentCard } from "@/components/layout/content-card";
import { cn } from "@/lib/utils";

export interface LinkedEntity {
  uuid: string;
  name: string;
  subtitle?: string;
  description?: string;
}

interface LinkedEntitiesSectionProps {
  title: string;
  description?: string;
  items: LinkedEntity[];
  editing: boolean;
  options: PickerOption[];
  pickerPlaceholder: string;
  onAdd: (uuid: string) => void;
  onRemove: (uuid: string) => void;
  error?: string | null;
  emptyTitle: string;
  emptyDescription?: string;
  emptyEditingDescription?: string;
  gridClassName?: string;
  className?: string;
  children?: ReactNode;
}

export function LinkedEntitiesSection({
  title,
  description,
  items,
  editing,
  options,
  pickerPlaceholder,
  onAdd,
  onRemove,
  error,
  emptyTitle,
  emptyDescription,
  emptyEditingDescription,
  gridClassName = "sm:grid-cols-2 xl:grid-cols-3",
  className,
  children,
}: LinkedEntitiesSectionProps) {
  return (
    <ContentCard className={cn("space-y-4", className)}>
      <SectionTitle
        title={title}
        description={editing ? description : undefined}
        className="mb-5 md:items-center"
      />

      {children}

      {editing && (
        <LinkedEntityPicker options={options} placeholder={pickerPlaceholder} onSelect={onAdd} />
      )}

      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={editing ? emptyEditingDescription : emptyDescription}
        />
      ) : (
        <div className={cn("grid max-h-[17rem] grid-cols-1 gap-3 overflow-y-auto pr-1 scrollbar-slim", gridClassName)}>
          {items.map((item) => (
            <EntityCard
              key={item.uuid}
              name={item.name}
              subtitle={item.subtitle}
              description={item.description}
              onRemove={editing ? () => onRemove(item.uuid) : undefined}
            />
          ))}
        </div>
      )}
    </ContentCard>
  );
}
