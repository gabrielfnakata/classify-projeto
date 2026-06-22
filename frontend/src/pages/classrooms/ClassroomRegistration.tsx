import type { DataTableColumn } from "@/components/common/data-table";
import type { FilterConfig } from "@/components/filter-row/FilterRow";
import RegistrationPage from "@/components/page-templates/registration/RegistrationPage";
import useFetch from "@/hooks/useFetch";
import type { ClassroomDTO } from "@/shared/dtos/classroom/ClassroomDTO";

export default function ClassroomRegistration() {
    const columns: DataTableColumn<ClassroomDTO>[] = [
        {key: 'name', header: 'Nome', cell: row => row.name},
        {key: 'capacity', header: 'Capacidade', cell: row => row.capacity},
        {key: 'isDisabled', header: 'Desativada', cell: row => {return row.isDisabled ? "Sim" : "Não"}},
    ];
    const filters: FilterConfig[] = [
        {name: 'name', inputType: 'text', placeholder: 'Nome', width: 33},
        {name: 'capacity', inputType: 'number', placeholder: 'Capacidade', width: 33},
        {name: 'isDisabled', inputType: 'select', options: [{value: "false", label: "Não"}, {value: "true", label: "Sim"}], placeholder: 'Desativada', width: 33},
    ];
    const {data} = useFetch<ClassroomDTO>('/classroom');
    return (
        <>
            <RegistrationPage
                data={data ?? []} 
                columns={columns}
                filters={filters}
                title="Sala de Aula"
                registrationRoute="/new-classroom"
            >
            </RegistrationPage>  
        </>
    );
};
