import { useField } from "formik";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormikSelectFieldProps {
    name: string;
    label?: string;
    placeholder?: string;
    options: { label: string; value: string }[];
    onValueChange?: (value: string) => void;
    required?: boolean;
}

export function FormikSelectField({ 
    name, 
    options,
    placeholder,
    onValueChange,
    required,
}: FormikSelectFieldProps) {
    const [field, , helpers] = useField(name);
    return (
        <div className="relative">
            <Select
                value={field.value}
                onValueChange={(value) => {
                    helpers.setValue(value);
                    onValueChange?.(value);
                }}
            >
                <SelectTrigger 
                    className="flex h-8 w-full items-center justify-between rounded-xl border border-border bg-filter-surface px-3 text-sm text-foreground transition-colors" 
                >
                    <SelectValue placeholder={placeholder}/>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <select
                required={required}
                value={field.value}
                onChange={() => {}}
                tabIndex={-1}
                aria-hidden="true"
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    width: 1,
                    height: 1,
                    opacity: 0,
                    pointerEvents: "none",
                }}
            >
                <option value="" />
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    );
}