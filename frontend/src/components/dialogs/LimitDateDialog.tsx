import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog.tsx";
import {useEffect, useState} from "react";
import {Calendar as CalendarIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar.tsx";
import {Button} from "@/components/ui/button.tsx";
import {ContentCard} from "@/components/layout/content-card.tsx";

interface LimitDateDialogProps {
    initialDate: Date;
    onDateChange: (date: Date) => void;
}

export default function LimitDateDialog( { initialDate, onDateChange }: LimitDateDialogProps ) {
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
                    className="h-10 px-5 bg-button-background rounded-xl text-sm font-semibold
                    hover:bg-button-highlight hover:cursor-pointer"
                >
                    <CalendarIcon/> Alterar Data Limite
                </Button>
            </DialogTrigger>
            <DialogContent>
                <ContentCard
                    className="bg-background"
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
