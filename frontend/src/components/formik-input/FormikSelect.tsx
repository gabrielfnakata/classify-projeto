import { useField } from "formik";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface FormikSelectFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    options: { label: string; value: string }[];
}

export function FormikSelectField({ 
    name, 
    options,
    placeholder,
}: FormikSelectFieldProps) {
    const [field, , helpers] = useField(name);
        return (
        <Select
            value={field.value}
            onValueChange={(value) => helpers.setValue(value)}
        >
            <SelectTrigger 
                className="flex h-8 w-full items-center justify-between rounded-xl border border-border bg-filter-surface px-3 text-sm text-foreground transition-colors" 
            >
                <SelectValue placeholder={placeholder}/>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    {options.map((option) => {
                        return (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        )
                    })}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}