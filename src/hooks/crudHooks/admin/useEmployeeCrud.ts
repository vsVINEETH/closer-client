"use client";
import { useCrudService } from "@/services/adminServices/crudService";
import { errorToast } from "@/utils/toasts/toast";
import { EmployeeCreateData, SearchFilterSortParams } from "@/types/customTypes";
import { useLoading } from "@/context/LoadingContext";


export const useEmployeeCrud = () => {
    const {postEmployee, listEmployee} = useCrudService();
    const {isLoading, setLoading} = useLoading();

    const createEmployee = async (employeeData: EmployeeCreateData, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await postEmployee(employeeData, searchFilterSortParams);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    };

    const blockEmployee = async (employeeId: string, searchFilterSortParams: SearchFilterSortParams) => {
        setLoading(true);
        const response = await listEmployee(employeeId, searchFilterSortParams);

        if(response.error){
         errorToast(response.error)
        }

        setLoading(false);
        return response;
    }

    return {isLoading, createEmployee, blockEmployee}

}