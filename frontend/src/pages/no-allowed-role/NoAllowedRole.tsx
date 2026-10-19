import { ArrowLeft, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ContentCard } from "@/components/layout/content-card";

export default function NoAllowedRole() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-full items-center justify-center px-4 py-8">
            <ContentCard className="w-full max-w-lg">
                <div className="flex flex-col items-center gap-5 text-center">
                    <div
                        className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive"
                        aria-hidden="true"
                    >
                        <ShieldAlert className="size-7" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <h1 className="text-xl font-semibold tracking-normal">
                            Acesso não autorizado
                        </h1>
                        <p className="text-sm leading-6 text-muted-foreground">
                            Sua conta não tem a permissão necessária para acessar
                            esta página. Se você acredita que isso é um engano,
                            entre em contato com o administrador.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        <ArrowLeft />
                        Voltar
                    </Button>
                </div>
            </ContentCard>
        </div>
    );
}