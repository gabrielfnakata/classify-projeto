export function OwnTeacherField({ name }: { name: string }) {
  return (
    <p className="flex h-9 items-center rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground">
      {name} <span className="ml-1.5 text-muted-foreground">(você)</span>
    </p>
  );
}
