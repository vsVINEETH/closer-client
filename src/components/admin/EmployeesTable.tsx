'use client'
import React, {useState, useEffect} from 'react';
import { SlidersHorizontal, UserPlus, Search} from 'lucide-react';
import { errorToast, successToast } from '@/utils/toasts/toast';
import { blockConfirm, createConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { useEmployeeCrud } from '@/hooks/crudHooks/admin/useEmployeeCrud';
import NoContent from '../reusables/NoContent';
import DataTable from '../reusables/Table';

interface EmployeeData {
    id: string,
    name: string,
    email: string,
    createdAt: string,
    isBlocked: boolean,
}

interface createFormData {
    name: string,
    email: string,
}

interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
};

interface Errors {
    name?: string,
    email?: string,
    date?: string,
};

const column = [
  { key: "id", label: "EMP ID", sortable: true },
  { key: "name", label: "Employee", sortable: true },
  
  { 
    key: "isBlocked", 
    label: "Status", 
    sortable: false, 
    render: (item: EmployeeData) => (item.isBlocked ? "Blocked" : "Active") 
  },
  { key: "createdAt", label: "Employed", sortable: true },
]

const EmployeesTable: React.FC = () => {
    const [createModal, setCreateModal] = useState<boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({name: '', email: ''});
    const [errors, setErrors] = useState<Errors>({});

    // search and filter
    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof EmployeeData; direction: 'asc' | 'desc' } | null>(null);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});
   
    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(3);

    const [totalPage, setTotal] = useState<number>(0)

    const [result, setReasult] = useState<EmployeeData[]>([]);

    const {createEmployee, blockEmployee} = useEmployeeCrud()
    const {getEmployeeData} = useFetch();

    useEffect(() => {
        fetchData();
    }, [searchValue, filterOption, currentPage, pageSize, sortConfig]);

    const fetchData = async () => {
        try {
            const response = await getEmployeeData({
                search: searchValue || '',
                startDate: filterOption.startDate || '',
                endDate: filterOption.endDate || '',
                status: filterOption.status,
                sortColumn: sortConfig?.column || 'createdAt',
                sortDirection: sortConfig?.direction || 'asc',
                page: currentPage,
                pageSize: pageSize,
            });

            if(response.data){
                const data = response.data;
                setReasult(data.employee);
                setTotal(data.total)
            }

        } catch (error) {
           errorToast(error);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validation()){
            const confirm = await createConfirm();
            if(!confirm){return};
            const response = await createEmployee(createFormData);

            if(response.data){
                successToast('Employee created')
                setCreateModal(false);
                fetchData(); // it should be changed
            }
        }

    };

    const handleBlock = async (employeeId: string, index: number) => {
        
        const confirm = await blockConfirm(!result[index].isBlocked);
        if(!confirm){return}
        const response = await blockEmployee(employeeId)

        if(response.data){
            successToast("Employee has been blocked");
            //setReasult(response.data.employee);
            fetchData()
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCreateFormData((prev) => ({
            ...prev,
            [name]: value
        }))
        setErrors({})
    }
    
    const handleCancel = () => {
        setCreateModal(false);
        setErrors({});
    }

    const validation = () => {
        const newErrors: Errors = {};
        const emailRegex: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

        if(!createFormData.name.trim()){
            newErrors.name = 'Name is required'
          }

        if(!createFormData.email.trim()){
            newErrors.email = 'Email is required'
          } else if (!emailRegex.test(createFormData.email)){
            newErrors.email = "Email is invalid"
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        
    };

    const handleSort = (column: keyof EmployeeData) => {
        setSortConfig((prev) => {
            const isSameColumn = prev?.column === column;
            return {
                column,
                direction: isSameColumn && prev?.direction === 'asc' ? 'desc' : 'asc',
            };
        });
    };
    
//filter
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target
        setFilterOption((prev) => ({
            ...prev,
            [name]: name === 'status' ? value === '1' : value, // Convert status to boolean
          }));
          setErrors({});
    }

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault();
        const { startDate, endDate} = filterOption;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (!validateDateRange(start, end)) {
            return;
        }

        setFilterModal(false);
        setFilterStatus(true);
    };
    
    const validateDateRange = (start: Date | null, end: Date | null): boolean => {
        const currentDate = new Date();
        const startDate = start 
        const endDate = end
        const newError: Errors = {}
    
        // If either start or end date is invalid
        if (!startDate && !endDate) {
            return true
        } else if (!startDate || !endDate) {
            newError.date ='Both start and end dates must be valid'
        } else if (startDate > endDate) {
            newError.date = 'Start date must be before or equal to end date'
        } else if (startDate > currentDate && endDate > currentDate) {
            newError.date = 'Start and end dates must not be in the future'
        } else if (startDate > currentDate) {
            newError.date = 'Start date must not be in the future'
        } else if (endDate > currentDate) {
            newError.date = 'End date must not be in the future' 
        }
    
        setErrors(newError);
        return Object.keys(newError).length == 0
    };
    
    const removeFilter = () => {
        setFilterOption({startDate: '', endDate: '', status: undefined})
        setFilterStatus(false);
    }
//pagination
    const handleNext = () => {
        if (currentPage < Math.ceil(totalPage / pageSize)) {
            setCurrentPage((prevPage) => prevPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1);
        }
    };

  return (

    <div className="relative flex flex-col w-full h-full text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray  bg-clip-border ">
        {/* head */}
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray rounded-none bg-clip-border">
        <div className="flex items-center justify-between gap-8 mb-8">
            <div>
            <h5
                className="block font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900 dark:text-lightGray">
                Employees
            </h5>

            </div>

            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
            
             <button
                className="select-none rounded-lg border flex gap-1 dark:text-lightGray dark:border-lightGray  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={ !filterStatus ? () => setFilterModal(true) : removeFilter}>
                 <SlidersHorizontal size={15}/>
              { !filterStatus ?  "Filter" : 'Remove'}
             </button>
           
      
             <button
                className="flex select-none items-center gap-3 rounded-lg dark:text-darkGray dark:bg-lightGray bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={() => setCreateModal(true)} >
                <UserPlus size={15}/>
                Add Employee
             </button>
             
         </div>
       
        </div>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="block w-full overflow-hidden md:w-max">

            </div>
            <div className="w-full md:w-72">
            <div className="relative h-10 w-full min-w-[200px]">
                <div className="absolute grid w-5 h-5 top-2/4 right-3 -translate-y-2/4 place-items-center text-blue-gray-500 dark:text-gray-300">
                    <Search size={18} />
                </div>
                    <input
                        className="peer h-full w-full rounded-[7px] border border-blue-gray-200 dark:border-gray-600 border-t-transparent bg-transparent dark:bg-darkGray px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-200 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 dark:placeholder-shown:border-gray-600 dark:placeholder-shown:border-t-gray-600 focus:border-2 focus:border-gray-900 dark:focus:border-gray-400 focus:border-t-transparent dark:focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 dark:disabled:bg-gray-700"
                        placeholder=" "
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <label
                        className="before:content[' '] after:content[' '] pointer-events-none absolute left-0 -top-1.5 flex h-full w-full select-none !overflow-visible truncate text-[11px] font-normal leading-tight text-gray-500 dark:text-gray-400 transition-all before:pointer-events-none before:mt-[6.5px] before:mr-1 before:box-border before:block before:h-1.5 before:w-2.5 before:rounded-tl-md before:border-t before:border-l before:border-blue-gray-200 dark:before:border-gray-600 before:transition-all after:pointer-events-none after:mt-[6.5px] after:ml-1 after:box-border after:block after:h-1.5 after:w-2.5 after:flex-grow after:rounded-tr-md after:border-t after:border-r after:border-blue-gray-200 dark:after:border-gray-600 after:transition-all peer-placeholder-shown:text-sm peer-placeholder-shown:leading-[3.75] peer-placeholder-shown:text-blue-gray-500 dark:peer-placeholder-shown:text-gray-400 peer-placeholder-shown:before:border-transparent peer-placeholder-shown:after:border-transparent peer-focus:text-[11px] peer-focus:leading-tight peer-focus:text-gray-900 dark:peer-focus:text-gray-200 peer-focus:before:border-t-2 peer-focus:before:border-l-2 peer-focus:before:!border-gray-900 dark:peer-focus:before:!border-gray-400 peer-focus:after:border-t-2 peer-focus:after:border-r-2 peer-focus:after:!border-gray-900 dark:peer-focus:after:!border-gray-400 peer-disabled:text-transparent peer-disabled:before:border-transparent peer-disabled:after:border-transparent peer-disabled:peer-placeholder-shown:text-blue-gray-500 dark:peer-disabled:peer-placeholder-shown:text-gray-400"
                    >
                        Search
                    </label>
                </div>

            </div>
        </div>
        </div>

        {/* table */}
     { result.length ? ( 
        <>
        <DataTable 
        columns={column} 
        data={result} 
        onBlocked={handleBlock} 
        onSort={handleSort} 
        pageSize={pageSize}
        totalPage={totalPage}
        currentPage={currentPage}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        />
       
        {/* <div className="p-6 px-0 overflow-x-auto">
        <table className="w-full mt-4 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-darkGray text-gray-800 dark:text-gray-300 text-sm tracking-wider">
            <tr>
            {['EMP ID', 'Employee', 'Status', 'Employed', 'Action'].map((header, index) => (
                <th key={index} className="p-4 border-b border-gray-300 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    onClick={() =>  header !== 'Action' ? handleSort(columnMap[header]) : null
                    }>
                    <div className="flex items-center justify-center gap-2">
                        {header}
                        {['EMP ID', 'Employee', 'Employed'].includes(header) && <ChevronsUpDown size={14} />}
                    </div>
                </th>
            ))}
            </tr>
            </thead>

            <tbody className="text-gray-800 dark:text-gray-200 text-sm">
            {result?.map((value, index) => (
            <tr key={index} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-darkGray transition-all">
                <td className="p-4 text-center font-medium">{value.id.slice(7, 16)}</td>
                <td className="p-4 text-center truncate max-w-[150px]">
                    <p className="font-medium">{value.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{value.email}</p>
                </td>
                <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-md uppercase ${value.isBlocked ? 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-300' : 'bg-green-500/20 text-green-600 dark:bg-green-400/20 dark:text-green-300'}`}>
                        {value.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </td>
                <td className="p-4 text-center">{value.createdAt}</td>
                <td className="p-4 flex justify-center gap-3">

                
                    <button className="px-4 py-1.5 text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => handleBlock(value.id, index)}>
                        {value.isBlocked ? 'Unblock' : 'Block'}
                    </button>
           
                </td>
            </tr>
            ))}
            </tbody>
        </table>
        </div> */}


        {/* bottom */}
        {/* <div className="flex items-center justify-between p-4  border-blue-gray-50">
            <p className="text-sm">
                Page {currentPage} of {Math.ceil(totalPage / pageSize)}
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="select-none rounded-lg border dark:border-gray-50 dark:text-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage >= Math.ceil(totalPage / pageSize)}
                    className="select-none rounded-lg border dark:border-gray-50 dark:text-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >  
                    Next
                </button>
            </div>
       </div> */}
       </>
       ) : <NoContent message='No employees added'/>}

        {/* modalCreateEmployee */}
        {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-md shadow-lg max-w-md w-full border dark:border-gray-700">
            <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Create Employee
            </h1>

            <form className="mx-auto max-w-xs flex flex-col gap-3" onSubmit={handleSubmit}>
                {/* Name Input */}
                <div>
                <input
                    type="text"
                    name="name"
                    placeholder="Enter name"
                    className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                    onChange={handleChange}
                />
                {errors?.name && <span className="text-red-500 text-xs">{errors.name}</span>}
                </div>

                {/* Email Input */}
                <div>
                <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                    onChange={handleChange}
                />
                {errors?.email && <span className="text-red-500 text-xs">{errors.email}</span>}
                </div>

                {/* Buttons */}
                <div className="flex justify-center gap-3 mt-4">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-900 transition focus:ring-2 focus:ring-blue-400 text-sm"
                >
                    Create
                </button>
                <button
                    type="button"
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition focus:ring-2 focus:ring-gray-300 text-sm"
                    onClick={handleCancel}
                >
                    Cancel
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

    {filterModal && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg transform transition-transform scale-95 w-full max-w-md border dark:border-gray-700">
        <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white">Filter</h1>

        <form className="mx-auto max-w-xs flex flex-col gap-4" onSubmit={handleFilter}>
            {/* Date Range Input */}
            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
            <input
                type="date"
                name="startDate"
                className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                onChange={handleFilterChange}
            />
            </div>

            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
            <input
                type="date"
                name="endDate"
                className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                onChange={handleFilterChange}
            />
            {errors?.date && <span className="text-red-500 text-sm">{errors.date}</span>}
            </div>

            {/* Status Input */}
            <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
                name="status"
                className="border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                onChange={handleFilterChange}
            >
                <option value="">Select Status</option>
                <option value="-1">Active</option>
                <option value="1">Blocked</option>
            </select>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
            <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-900 transition focus:ring-2 focus:ring-blue-400 text-sm"
            >
                Apply
            </button>

            <button
                type="button"
                onClick={() => setFilterModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition focus:ring-2 focus:ring-gray-300 text-sm"
            >
                Cancel
            </button>
            </div>
        </form>
        </div>
    </div>
    )}
    </div>
  
  )
}

export default EmployeesTable