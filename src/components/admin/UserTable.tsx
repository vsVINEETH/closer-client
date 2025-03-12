'use client'
import React, {useState, useEffect} from 'react';
import { SlidersHorizontal, Search } from 'lucide-react';
import { errorToast, successToast } from '@/utils/toasts/toast';
import { banConfirm, blockConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { useUserCrud } from '@/hooks/crudHooks/admin/useUserCrud';
import NoContent from '../reusables/NoContent';
import DataTable from '../reusables/Table';
import { useDebounce } from '@/hooks/helperHooks/useDebounce';

interface UserData {
    id: string,
    username: string,
    email: string,
    createdAt: string,
    isBlocked: boolean,
    isBanned: boolean,
    blockedUser: string[],
    reportedUsers: string[],
    banExpiresAt: string,
}

interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
}

interface Errors {
    name?: string,
    email?: string,
    date?: string,
}

 const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "username", label: "User", sortable: true },
    { 
        key: "isBlocked", 
        label: "Status", 
        sortable: false, 
        render: (item: UserData) => (item.isBlocked ? "Blocked" : "Active") 
      },
    { key: "createdAt", label: "Joined", sortable: true },
    { key: "reportedUsers", label: "Reports", sortable: false },
    { 
        key: "isBanned", 
        label: "Ban", 
        sortable: false, 
      },
  ];
  
const UserTable: React.FC = () => {
    const [userData, setUserData] = useState<UserData[]>([]);
    const [errors, setErrors] = useState<Errors>({});

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof UserData; direction: 'asc' | 'desc' } | null>(null);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});

    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(2);
    const [totalPage, setTotal] = useState<number>(0)
    const [result, setResult] = useState<UserData[]>([]);

    const {getUsersData} = useFetch();
    const {blockUser, banUser, unbanUser} = useUserCrud();

    const debouncedSearch = useDebounce(searchValue, 800);

    const searchFilterSortPagination = {
        search: debouncedSearch || '',
        startDate: filterOption.startDate || '',
        endDate: filterOption.endDate || '',
        status: filterOption.status ,
        sortColumn: sortConfig?.column || 'createdAt',
        sortDirection: sortConfig?.direction || 'desc',
        page: currentPage,
        pageSize: pageSize, 
    };
    

    useEffect(() => {
        fetchData();
    }, [debouncedSearch, filterOption, currentPage, pageSize, sortConfig]);


    const fetchData = async () => {
        try {
            const response = await getUsersData(searchFilterSortPagination);

            if(response.data){
                const data = response.data;
                setUserData(data.users);
                setResult(data.users);
                setTotal(data.total)
            }
        } catch (error) {
            console.error(error)
            errorToast('Something happend')
        }
    }

    const handleBlock = async (userId: string, index: number) => {
        const confirm = await blockConfirm(!result[index].isBlocked);
        if(!confirm){ return };
        const response = await blockUser(userId,searchFilterSortPagination);

        if(response.data){
            const data = response.data;
            setUserData(data.users);
            setResult(data.users);
            setTotal(data.total)
        };
    };


    //ban
    const handleBanUser = async(userId: string, duration: string, index: number) => {
        const confirm = await banConfirm(!result[index].isBanned, duration);
        if(!confirm){return}
        const response = await banUser(userId, duration, searchFilterSortPagination);

        if(response.data){
            const data = response.data;
            setUserData(data.users);
            setResult(data.users);
            setTotal(data.total)
            successToast("User banned");
        }
    }

    const handleUnban = async(userId: string, index: number) => {
        const confirm = await banConfirm(!result[index].isBanned);
        if(!confirm){return}
        const response = await unbanUser(userId, searchFilterSortPagination)

        if(response.data){
            const data = response.data;
            setUserData(data.users);
            setResult(data.users);
            setTotal(data.total)
            successToast("User unbanned");
        }
    }


    const handleSort = (column: keyof UserData) => {
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
        
        const { startDate, endDate } = filterOption;
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
        setFilterStatus(false);
        setFilterOption({startDate: '', endDate: '', status: undefined})
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
                User
            </h5>

            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
  
             <button
                className="select-none rounded-lg border flex gap-1 dark:text-lightGray dark:border-lightGray  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={ !filterStatus ? () => setFilterModal(true) : removeFilter}>
                 <SlidersHorizontal size={10}/>
                 { !filterStatus ?  "Filter" : 'Remove'}
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

     {userData.length || result.length ?(       
        <>
        <DataTable
        columns={columns}
        data={result}
        onSort={handleSort}
        onBlocked={handleBlock}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPage={totalPage}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleBanUser={handleBanUser}
        handleUnban={handleUnban}

        />
        {/* <div className="p-6 px-0 overflow-x-auto">
        <table className="w-full mt-4 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-darkGray text-gray-800 dark:text-gray-300 text-sm tracking-wider">
            <tr>
            {['ID', 'User', 'Status', 'Joined', 'Reports', 'Ban', 'Action'].map((header, index) => (
                <th key={index} className="p-4 border-b border-gray-300 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    onClick={() => 
                        ['ID', 'User', 'Joined'].includes(header) ? handleSort(columnMap[header]) : null
                    }>
                    <div className="flex items-center justify-center gap-2">
                        {header}
                        {['ID', 'User', 'Joined'].includes(header) && <ChevronsUpDown size={14} />}
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
                    <p className="font-medium">{value.username}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{value.email}</p>
                </td>
                <td className="p-4 text-center">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-md uppercase ${value.isBlocked ? 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-300' : 'bg-green-500/20 text-green-600 dark:bg-green-400/20 dark:text-green-300'}`}>
                        {value.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                </td>
                <td className="p-4 text-center">{value.createdAt}</td>
                <td className="p-4 text-center">{value.reportedUsers.length ? value.reportedUsers.length : 0}</td>
                <td className="p-4 text-center justify-items-center">
                    {!value.isBanned ? (
                        <select
                            onChange={(e) => handleBanUser(value.id, e.target.value, index)}
                            className="text-xs p-1 border border-gray-300 rounded-md dark:border-gray-300 dark:text-darkGray bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        >
                            <option value="" >Ban Duration</option>
                            {banOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    ) : (
                        <div className="flex flex-col items-center gap-1 p-2 rounded-md shadow-sm w-28">
                            <button className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                                    onClick={() => handleUnban(value.id, index)}>
                                Unban
                            </button>
                            <p className="text-xs font-medium text-gray-700 dark:text-lightGray">
                                {Math.ceil((new Date(value.banExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                            </p>
                        </div>
                    )}
                </td>
                <td className="p-4 flex justify-center text-center gap-3">
                    <button className="px-4 py-1.5 min-w-20 max-w-20  text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => handleBlock(value.id, index)}>
                        {value.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                </td>
            </tr>
            ))}
            </tbody>
        </table>
        </div> */}

        {/* <div className="flex items-center justify-between p-4  border-blue-gray-50">
            <p className="text-sm">
                Page {currentPage} of {Math.ceil(totalPage/ pageSize)}
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="select-none rounded-lg border dark:text-gray-50 dark:border-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage >= Math.ceil(totalPage / pageSize)}
                    className="select-none rounded-lg border dark:text-gray-50 dark:border-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >  
                    Next
                </button>
            </div>
       </div> */}
       </>)
       : <NoContent message='No users registered yet'/>}

        {/* modalFilter */}
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

export default UserTable