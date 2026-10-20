import { useEffect, useState } from "react";
import { CalendarCheck, CalendarX, CheckCircle2, Clock, Loader2, User } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";

import { EmptyState } from "@/components/common/empty-state";
import { SectionTitle } from "@/components/features/section-title";
import { ContentCard } from "@/components/layout/content-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/useFetch";
import api from "@/services/api";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";
import type { PaginationDTO } from "@/shared/dtos/pagination/PaginationDTO";
import { apiErrorMessage } from "@/shared/utils/api-error";
import { formatFullDateLabel, formatHHMM, toDate } from "@/shared/utils/date-formatter";
import { cn } from "@/lib/utils";

interface ScheduleRequestPreview {
    studentName: string;
    teacherName: string;
    subjectName: string;
    startTime: string;
    endTime: string;
}

type Action = "accept" | "decline";

export default function ScheduleRequestReview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [action, setAction] = useState<Action>(searchParams.get("action") === "decline" ? "decline" : "accept");

    const [request, setRequest] = useState<ScheduleRequestPreview | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    useEffect(() => {
        if (!token) return;
        api.get<ScheduleRequestPreview>("/classsession/requests/preview", { params: { token }, data: {}, skipExceptionModal: true })
            .then((res) => setRequest(res.data))
            .catch((err) => setLoadError(apiErrorMessage(err, "O link é inválido, expirou ou não é de uma aula sua.")));
    }, [token]);

    const { data: classroomsData } = useFetch<PaginationDTO<ClassroomDTO>>("/classroom");
    const classrooms = (classroomsData?.content ?? []).filter((c) => !c.isDisabled);

    const [classroomUuid, setClassroomUuid] = useState("");
    const [reason, setReason] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [done, setDone] = useState<Action | null>(null);

    const handleConfirm = async () => {
        setPending(true);
        setError(null);
        try {
            await api.post(
                `/classsession/requests/${action}`,
                { token, classroomUuid: action === "accept" ? classroomUuid : null, reason: action === "decline" ? reason.trim() : null },
                { skipExceptionModal: true }
            );
            setDone(action);
        } catch (err) {
            setError(apiErrorMessage(err, "Não foi possível responder a solicitação. Tente novamente."));
        } finally {
            setPending(false);
        }
    };

    return (
        <div className="animate-in fade-in space-y-6 p-6 duration-500 md:p-8">
            <SectionTitle title="Solicitação de aula" description="Um aluno pediu uma aula individual com você." />

            <ContentCard className="mx-auto max-w-2xl space-y-6">
                {!token || loadError ? (
                    <EmptyState
                        title="Não foi possível abrir esta solicitação"
                        description={loadError ?? "Abra o link que veio no e-mail da solicitação."}
                        action={<Button variant="outline" onClick={() => navigate("/schedule")}>Ir para a agenda</Button>}
                    />
                ) : !request ? (
                    <div className="flex h-48 items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-3 py-6 text-center">
                        <CheckCircle2 className="h-10 w-10 text-success-foreground" />
                        <p className="text-lg font-semibold text-foreground">
                            {done === "accept" ? "Aula agendada!" : "Solicitação recusada"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {done === "accept"
                                ? `A aula com ${request.studentName} já está na agenda, e o aluno foi avisado por e-mail.`
                                : `${request.studentName} foi avisado(a) por e-mail.`}
                        </p>
                        <Button className="mt-2" onClick={() => navigate("/schedule")}>Ir para a agenda</Button>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-4 rounded-xl border border-border bg-panel-soft p-5 sm:grid-cols-2">
                            <Info icon={User} label="Aluno" value={request.studentName} />
                            <Info icon={User} label="Professor" value={request.teacherName} />
                            <Info icon={CalendarCheck} label="Disciplina" value={request.subjectName} />
                            <Info
                                icon={Clock}
                                label="Quando"
                                value={`${formatFullDateLabel(toDate(request.startTime))}, ${formatHHMM(request.startTime)}–${formatHHMM(request.endTime)}`}
                            />
                        </div>

                        <div className="inline-flex rounded-lg border border-border bg-panel-strong p-1 shadow-sm">
                            {([
                                { value: "accept", label: "Aceitar", icon: CalendarCheck },
                                { value: "decline", label: "Recusar", icon: CalendarX },
                            ] as const).map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => { setAction(option.value); setError(null); }}
                                    className={cn(
                                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                                        action === option.value
                                            ? "bg-card text-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    <option.icon className="h-4 w-4" />
                                    {option.label}
                                </button>
                            ))}
                        </div>

                        {action === "accept" ? (
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Sala da aula</Label>
                                <Select value={classroomUuid} onValueChange={setClassroomUuid}>
                                    <SelectTrigger className="w-full sm:w-72"><SelectValue placeholder="Escolha a sala..." /></SelectTrigger>
                                    <SelectContent position="popper" className="max-h-72">
                                        {classrooms.map((c) => <SelectItem key={c.uuid} value={c.uuid}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Ao aceitar, o sistema confere conflitos de horário e a capacidade da sala, como em qualquer agendamento.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label className="text-xs text-muted-foreground">Motivo (opcional, vai para o aluno)</Label>
                                <Textarea
                                    value={reason}
                                    maxLength={500}
                                    rows={3}
                                    placeholder="Ex.: não tenho esse horário livre; que tal na quinta às 15h?"
                                    onChange={(e) => setReason(e.target.value)}
                                />
                            </div>
                        )}

                        {error && (
                            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                                {error}
                            </p>
                        )}

                        <div className="flex justify-end">
                            <Button
                                variant={action === "decline" ? "destructive" : "default"}
                                disabled={pending || (action === "accept" && !classroomUuid)}
                                onClick={handleConfirm}
                            >
                                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                                {action === "accept" ? "Aceitar e agendar" : "Recusar solicitação"}
                            </Button>
                        </div>
                    </>
                )}
            </ContentCard>
        </div>
    );
}

function Info({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="flex items-center gap-1.5 text-sm text-foreground">
                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {value}
            </p>
        </div>
    );
}
