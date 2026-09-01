import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {useEffect, useState} from "react";
import {Calendar as CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ContentCard} from "@/components/layout/content-card.tsx";

interface LimitDateDialogProps {
    initialDate: Date;
    onDateChange: (date: Date) => void;
    buttonVariant: "secondary" | "link" | "default" | "outline" | "ghost" | "destructive" | null | undefined;
}

export default function LimitDateDialog( { initialDate, onDateChange, buttonVariant }: LimitDateDialogProps ) {
    const [ open, setOpen ] = useState<boolean>(false);
    const [ limitDate, setLimitDate ] = useState<Date | undefined>(initialDate);
    const minDate = new Date();

    useEffect(() => {
        onDateChange(limitDate ?? new Date());
    }, [limitDate]);

    const handleSelect = (date: Date | undefined) => {
        setLimitDate(date);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
                <Button
                    variant={buttonVariant}
                    className="h-10 px-5 rounded-xl text-sm font-semibold
                    hover:cursor-pointer"
                >
                    <CalendarIcon/> Alterar Data Limite
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle
                    hidden={true}
                >
                    Selecionar Data Limite
                </DialogTitle>
                <ContentCard
                    className="bg-background border-none shadow-none"
                >
                    <Calendar
                        className="w-full h-full"
                        mode="single"
                        selected={limitDate}
                        onSelect={handleSelect}
                        disabled={{ before: minDate }}
                        defaultMonth={limitDate}
                    />
                </ContentCard>
            </DialogContent>
        </Dialog>
    );
}
