import type { ReactNode } from "react";

import { ContentCard } from "@/components/layout/content-card";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthCard({ title, description, children }: AuthCardProps) {
  return (
    <div className="background w-screen min-h-screen flex flex-col items-center justify-center py-8">
      <ContentCard className="card rounded-2xl w-[36.5vw] min-w-[340px] py-[4vh] flex flex-col items-center justify-center">
        <img className="w-[25vw] min-w-[220px] h-[12vh] mb-[3vh]" src="/light logo.svg" alt="Classify" />

        <div className="w-[20vw] min-w-[280px] mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="w-[20vw] min-w-[280px]">{children}</div>
      </ContentCard>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
      <p className="leading-relaxed">{message}</p>
    </div>
  );
}
