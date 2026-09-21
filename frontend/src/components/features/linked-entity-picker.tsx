import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Input } from "@/components/ui/input";

export interface PickerOption {
  uuid: string;
  label: string;
  hint?: string;
}

interface LinkedEntityPickerProps {
  options: PickerOption[];
  placeholder: string;
  emptyText?: string;
  onSelect: (uuid: string) => void;
}

export function LinkedEntityPicker({
  options,
  placeholder,
  emptyText = "Nenhum resultado encontrado",
  onSelect,
}: LinkedEntityPickerProps) {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!query) return [];

    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(query) ||
        option.hint?.toLowerCase().includes(query)
    );
  }, [options, query]);

  const handleSelect = (uuid: string) => {
    setSearch("");
    onSelect(uuid);
  };

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-8"
      />
      {query && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover shadow-md">
          {matches.length === 0 ? (
            <p className="px-3 py-3 text-center text-sm text-muted-foreground">{emptyText}</p>
          ) : (
            matches.map((option) => (
              <button
                key={option.uuid}
                type="button"
                onClick={() => handleSelect(option.uuid)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted/50"
              >
                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{option.label}</span>
                {option.hint && (
                  <span className="ml-auto shrink-0 text-xs text-muted-foreground">{option.hint}</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
