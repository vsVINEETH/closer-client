'use client'
import React, {useState, useEffect} from 'react';
import { ChevronsUpDown, SlidersHorizontal, UserPlus, Search } from 'lucide-react';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, successToast } from '@/utils/toasts/toats';
import { Pencil } from 'lucide-react';

interface CategoryData {
    id: string,
    name: string,
    createdAt: string,
    isListed: boolean,
}

interface createFormData {
    name: string,
}

interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
}

interface Errors {
    name?: string,
    date?: string,
}

const CategoryTable: React.FC = () => {
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [createModal, setCreateModal] = useState<Boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({name: ''});
    const [errors, setErrors] = useState<Errors>({});
    const {handleRequest} = useAxios()

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof CategoryData; direction: 'asc' | 'desc' } | null>(null);

    const [filterModal, setFilterModal] = useState<Boolean>(false);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});
    const [filterData, setFilterData] = useState<CategoryData[]>([]);
    const [filterStatus, setFilterStatus] = useState<Boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(2);

    const [result, setResult] = useState<CategoryData[]>([]);

    const [editModal, setEditModal] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<CategoryData | null>(null);


    useEffect(() => {
        fetchData();
    },[]);

    useEffect(() => {
       setResult(
          searchValue ? filterData.filter(category =>
            category.name.toLowerCase().includes(searchValue.toLowerCase()) 
          ): filterData
        )
    },[searchValue, filterData]);


    const fetchData = async () => {
        try {
            const response = await handleRequest({
                url:'/api/employee/category_data',
                method:'GET'
            })

            if(response.error){
                errorToast(response.error)
            }

            if(response.data){
                const data = response.data;
                console.log(data);
                setCategoryData(data);
                setFilterData(data);
                setResult(data);
            }
            
        } catch (error) {
            errorToast(error);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setCreateFormData((prev) => ({
            ...prev,
            [name]: value
        }))
        setErrors({})
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validation()){
            console.log(createFormData)
            const response = await handleRequest({
                url:'/api/employee/create_category',
                method:'POST',
                data: createFormData
            });

            if(response.error){
                errorToast(response.error)
            }
            if(response.data){
                setCreateModal(false);
                fetchData()
                successToast('successfully created');
            }
        }

    }

    const handleCancel = () => {
        setCreateModal(false);
        setErrors({});
    }

    const handleListing = async (id: string) => {
        const response = await handleRequest({
            url:'/api/employee/list_category',
            method:'POST',
            data:{
                id: id
            }
        })

        if(response.error){
            errorToast(response.error)
            
        }

        if(response.data){
            setResult(response.data);
            successToast(response.data)
        }

    }

    const validation = () => {
        const newErrors: Errors = {};

        if(!createFormData.name.trim()){
            newErrors.name = 'Name is required'
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        
    }

    const editValidation = () => {
        const newErrors: Errors = {};
        if(!editFormData?.name.trim()){
            newErrors.name = 'This field is required'
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0
    }

    const handleSort = (column: keyof CategoryData) => {
    let direction: 'asc' | 'desc' = 'asc';

    // Toggle direction if the same column is clicked again
    if (sortConfig && sortConfig.column === column && sortConfig.direction === 'asc') {
        direction = 'desc';
    }

    setSortConfig({ column, direction });

    // Sort userData based on column and direction
    const sortedData = [...filterData].sort((a, b) => {
        let aValue: any = a[column];
        let bValue: any = b[column];

        // Handle date sorting specifically for the createdAt field
        if (column === 'createdAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        }

        // Sort in ascending or descending order
        if (aValue < bValue) {
            return direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    setFilterData(sortedData);
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
        
        const { startDate, endDate, status } = filterOption;
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (!validateDateRange(start, end)) {
            return;
        }
    
        const filtered = categoryData.filter((category) => {
            // Clone dates to avoid mutation
            const categoryDate = new Date(category.createdAt);
            categoryDate.setHours(0, 0, 0, 0);
    
            const startClone = start ? new Date(start) : null;
            const endClone = end ? new Date(end) : null;
    
            if (startClone) startClone.setHours(0, 0, 0, 0);
            if (endClone) endClone.setHours(0, 0, 0, 0);
    
            // Check if employeeDate is within the date range
            const isWithinDateRange = 
                (!startClone || categoryDate >= startClone) &&
                (!endClone || categoryDate <= endClone);
    
            // Check if employee status matches
            const isStatusMatch = status === undefined || category.isListed === status;
    
            return isWithinDateRange && isStatusMatch;
        });
    
        console.log('Filtered Category:', filtered);
        setFilterData(filtered);
        setResult(filtered);
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
        setFilterData(categoryData);
    }

//pagination

    const paginatedData = result.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    const handleNext = () => {
        if (currentPage < Math.ceil(result.length / pageSize)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleEditClick = (data: CategoryData) => {
        setEditFormData(data);
        setEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editValidation()) {
         const response = await handleRequest({
            url:'/api/employee/update_category',
            method:'PUT',
            data: editFormData || {},
        });

        if(response.error){
            errorToast(response.error)
        }
        if(response.data){
            setEditModal(false)
            setResult(response.data);
        }
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
                Category
            </h5>


            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">
          { !filterStatus ? 
             <button
                className="select-none rounded-lg border flex gap-1 dark:text-lightGray dark:border-lightGray  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={() => setFilterModal(true)}>
                 <SlidersHorizontal size={10}/>
                Filter
             </button>
            :
            <button
            className="select-none rounded-lg border flex gap-1 dark:text-lightGray dark:border-lightGray  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
            type="button" onClick={removeFilter}>
             <SlidersHorizontal size={10}/>
            Remove
           </button>
         }
            <button
                className="flex select-none items-center gap-3 rounded-lg dark:text-darkGray dark:bg-lightGray bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={() => setCreateModal(true)} >
                <UserPlus size={15}/>
                Add Category
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
                        className="peer h-full w-full rounded-[7px] border border-blue-gray-200 dark:border-gray-600 border-t-transparent bg-transparent dark:bg-gray-800 px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-200 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 dark:placeholder-shown:border-gray-600 dark:placeholder-shown:border-t-gray-600 focus:border-2 focus:border-gray-900 dark:focus:border-gray-400 focus:border-t-transparent dark:focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 dark:disabled:bg-gray-700"
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
        <div className="p-6 px-0 overflow-scroll overflow-x-hidden overflow-y-hidden">
        <table className="w-full mt-4 text-left table-auto min-w-max">
            <thead className='text-center'>
            <tr >
            <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    ID
                    <ChevronsUpDown size={13} onClick={() => handleSort('id')}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Category Name
                    <ChevronsUpDown size={13} onClick={() => handleSort('name')}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                        Status
                    <ChevronsUpDown size={13}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Created At
                    <ChevronsUpDown size={13} onClick={() => handleSort('createdAt')}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                  <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Action
                </p>
                </th>
            </tr>
            </thead>

            <tbody>

            {paginatedData.map((value, index) => {
            return(
            <tr key={index}>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p
                        className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
                        {value.id.split('').slice(7,16).join("")}
                    </p>
                    </div>
                </div>
                </td>
                <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {value.name}
                    </p>

                    </div>
                </div>
                </td>
                <td className="p-4">
                <div className="w-max">
                    <div
                    className="relative grid items-center px-2 py-1 font-sans text-xs font-bold uppercase rounded-md select-none whitespace-nowrap bg-blue-gray-500/20 text-blue-gray-900">
                        {!value.isListed ?
                         <span className="">Unlisted</span>
                         :
                         <span className="">Listed</span>
                        }
                    
                    </div>
                </div>
                </td>
                <td className="p-4">
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {value.createdAt}
                </p>
                </td>
                <td className="p-4">
                <button
                    className="relative h-10 max-h-[40px] w-24 max-w-[70px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none border dark:border-lightGray dark:bg-lightGray dark:text-darkGray "
                    type="button"
                    onClick={() => handleListing(value.id)}
                    >
                        {!value.isListed ? 
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:text-darkGray">
                            List
                        </span> 
                        :
                        <span className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:text-darkGray">
                            Unlist
                        </span>
                        }
                </button>
                <button className='ml-3'
                onClick={() =>handleEditClick(value)}
                >
                    <Pencil size={18}/>
                </button>
             </td>
            </tr>
            )
            })}
            </tbody>
        </table>
        </div>

        {/* bottom */}
        <div className="flex items-center justify-between p-4 border-t border-blue-gray-50">
            <p className="text-sm">
                Page {currentPage} of {Math.ceil(result.length / pageSize)}
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                    Previous
                </button>
                <button
                    onClick={handleNext}
                    disabled={currentPage >= Math.ceil(result.length / pageSize)}
                    className="select-none rounded-lg border border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >  
                    Next
                </button>
            </div>
       </div>

        {/* modalCreateEmployee */}
        {createModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-4 rounded-md shadow-lg max-w-md">
                <h1 className="text-center text-xl font-semibold">Create Category</h1>
                <form className="mx-auto max-w-xs flex flex-col gap-4" onSubmit={handleSubmit}>
                    <div className="mt-1">
                    <div className="flex flex-col">
                        <input
                        type="text"
                        name="name"
                        placeholder="Enter name"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.name && (
                        <span className="text-red-500 text-sm mt-1">{errors.name}</span>
                        )}
                    </div>
                    </div>

                    <div className="mt-1 flex justify-center">
                    <button className="border p-1 rounded-md shadow-md" type="submit">
                        Create
                    </button>
                    <button
                        className="border p-1 rounded-md ml-2 bg-darkGray text-white"
                        type="button"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                    </div>
                </form>
                </div>
            </div>
        )}

        {/* modalFilter */}
        {filterModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-lg max-w-md">
                <h1 className="text-center text-xl font-semibold">Filter</h1>
                <form className="mx-auto max-w-xs flex flex-col gap-4" onSubmit={handleFilter}>
                
                {/* Date Range Input */}
                <div className="flex flex-col mt-1">
                    <label className="text-sm font-semibold">Start Date</label>
                    <input
                    type="date"
                    name="startDate"
                    className="border p-1 rounded-md"
                    onChange={handleFilterChange}
                    />
                </div>
                <div className="flex flex-col mt-1">
                    <label className="text-sm font-semibold">End Date</label>
                    <input
                    type="date"
                    name="endDate"
                    className="border p-1 rounded-md"
                    onChange={handleFilterChange}
                    />
                    {errors && <span className='text-red-500'>{errors.date}</span>}
                </div>
                

                {/* Status Input */}
                <div className="mt-2 flex flex-col">
                    <label className="text-sm font-semibold">Status</label>
                    <select
                    name="status"
                    className="border p-1 rounded-md"
                    onChange={handleFilterChange}
                    >
                    <option value="">Select Status</option>
                    <option value="-1">Unlisted</option>
                    <option value="1">Listed</option>
                    </select>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 flex justify-center">
    
                    <button className="border p-1 rounded-md shadow-md" type="submit">
                    Apply
                    </button>
                

                    <button
                    className="border p-1 rounded-md ml-2 bg-darkGray text-white"
                    type="button"
                    onClick={() => setFilterModal(false)}
                    >
                    Cancel
                    </button>
                </div>
                </form>
            </div>
            </div>
        )}

        {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
            <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform scale-95">
            <h2 className="text-lg font-bold mb-4 text-darkGray">Edit Category</h2>
            <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-nightBlack">category name</label>
                <input
                    type="text"
                    name='name'
                    value={editFormData?.name || ''}
                    onChange={(e) =>
                    setEditFormData((prev) => prev && { ...prev, name: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors.name && <span className='text-red-500'>{errors.name}</span>}
                </div>
                <div className="flex justify-end gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-customPink text-white rounded-md"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="px-4 py-2 bg-darkGray rounded-md"
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

export default CategoryTable