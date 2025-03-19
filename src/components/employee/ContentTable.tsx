'use client'
import React, {useState, useEffect, useRef} from 'react';
import ReactCrop, { Crop,} from "react-image-crop";
import { SlidersHorizontal, Plus, Search, Pencil} from 'lucide-react';
import { errorToast, successToast } from '@/utils/toasts/toast';
import { createConfirm, editConfirm, deleteConfirm, listUnlistConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useContentCrud } from '@/hooks/crudHooks/employee/useContentCrud';
import { useFetch } from '@/hooks/fetchHooks/useEmployeFetch';
import NoContent from '../reusables/NoContent';
import DataTable from '../reusables/Table';
import { useDebounce } from '@/hooks/helperHooks/useDebounce';

interface ContentData {
    id: string,
    title: string,
    subtitle: string,
    content:string,
    image?:string,
    isListed: boolean,
    createdAt: string,
    category?: any,
}

interface createFormData {
    title: string,
    subtitle: string,
    content: string,
    image:File[],
    category: string
}

interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
}

interface Errors {
    title?: string,
    subtitle?:string,
    content?:string,
    image?:string,
    date?: string,
    category?: string,
}

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
interface CustomCrop extends Crop {
aspect?: number;
};


 const columns = [
    { key: "id", label: "ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    // { key: "subtitle", label: "Subtitle", sortable: true },
    // { key: "content", label: "Content", sortable: true },
    {key: 'image',
     label: 'Image',
     sortable: false,
    },
    { 
      key: "category", 
      label: "Category", 
      sortable: true, 
      render: (item: ContentData) => item.category?.name || "N/A" // Ensure a valid string
    },
    { 
      key: "isListed", 
      label: "Status", 
      sortable: false, 
      render: (item: ContentData) => (item.isListed ? "Listed" : "Unlisted") 
    },
    { key: "createdAt", label: "Created At", sortable: true },
  ];
  

const ContentTable: React.FC = () => {
    const [contentData, setContentData] = useState<ContentData[]>([]);
    const [category, seCategory] = useState<{ id: string; name: string }[]>([]);

    const [createModal, setCreateModal] = useState<boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({title: '', subtitle:'', content:'', image:[], category:''});
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const [crop, setCrop] = useState<Crop | undefined>();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof ContentData; direction: 'asc' | 'desc' } | null>(null);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});

    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(2);

    const [totalPage, setTotal] = useState<number>(0);

    const [editModal, setEditModal] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<ContentData | null>(null);

    const [result, setResult] = useState<ContentData[]>([]);
    const {createContent, controllContentListing, deleteExistingContent, editContent } = useContentCrud();
    const {getContentData} = useFetch();

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
            const response = await getContentData(searchFilterSortPagination)

            if(response.data){
                const data = response.data.data;
                const categoryData = response.data.category;
                seCategory(categoryData.category);
                setContentData(data.contents);
                setResult(data.contents);
                setTotal(data.total);
            }
        } catch (error) {
            console.error(error)
            errorToast('something happen')
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validation()){
            const confirm = await createConfirm();
            if(!confirm){ return }
            const contentData = new FormData();
            contentData.append('title', createFormData.title);
            contentData.append('subtitle', createFormData.subtitle);
            contentData.append('content', createFormData.content);
            contentData.append('category', createFormData.category);
            images.forEach((image: File) => {
                contentData.append('images', image); // 'images' is the field name you expect in the backend
            });

            const response = await createContent(contentData, searchFilterSortPagination)

            if(response.data){
                const data = response.data.data;
                setContentData(data.contents);
                setResult(data.contents);
                setTotal(data.total);

                setCreateModal(false);
                successToast('Successfully created');
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleListing = async (contentId: string, index: number) => {
        const confirm = await listUnlistConfirm(!contentData[index].isListed);
        if(!confirm){return};
        const response = await controllContentListing(contentId, searchFilterSortPagination);

        if(response.data){
            const data = response.data.data;
            const categoryData = response.data.category;
            seCategory(categoryData.category);
            setContentData(data.contents);
            setResult(data.contents);
            setTotal(data.total);
        }

    }

    const handleDelete = async (contentId: string) => {
        const confirm = await  deleteConfirm();
        if(!confirm){ return };
        const response = await deleteExistingContent(contentId, searchFilterSortPagination);

        if(response.data){
            const data = response.data.data;
            setContentData(data.contents);
            setResult(data.contents);
            setTotal(data.total);
        };
    };

    const validation = () => {
        const newErrors: Errors = {};

          if(!createFormData.title.trim()){
            newErrors.title = 'This field is required'
          }

          if(!createFormData.subtitle.trim()){
            newErrors.subtitle = "This field is required"
          }

          if(!createFormData.content.trim()) {
            newErrors.content = 'This field is required'
          }

          if (images.length < 1){
            newErrors.image = 'minimum 1 image is required'
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        
    }

    const editValidation = () => {
        const newErrors: Errors = {};
        if(!editFormData?.title.trim()){
            newErrors.title = 'This filed is required'
        }

        if(!editFormData?.subtitle.trim()){
            newErrors.subtitle = 'This field is required'
        }

        if(!editFormData?.content.trim()){
            newErrors.content = 'This field is required'
        }

        if(!editFormData?.category){
            console.log(editFormData?.category)
            newErrors.category = 'This field is required'
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0

    }

    const handleSort = (column: keyof ContentData) => {
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

    //img
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages(files) 
        setErrors({})
    
        const preview = files.map((file) => URL.createObjectURL(file));
        setImagePreviews(preview);
    }

    const handleImageRemove = (index: number) => {
    if(imagePreviews.length === 0){
        setCurrentImageIndex(null);
    } 

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
    setErrors({})
    }

    const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setCrop({ aspect: 1 / 1 }  as CustomCrop); // Set square aspect ratio, adjust as needed
    };

    const handleCropComplete = (crop: PixelCrop) => {
    if (imageRef.current && crop.width && crop.height) {
        const canvas = document.createElement("canvas");
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
        ctx.drawImage(
            imageRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        // Convert cropped image to a new preview URL
        canvas.toBlob((blob) => {
            if (blob && currentImageIndex !== null) {
            const newImageUrl = URL.createObjectURL(blob);

            setImagePreviews((prevPreviews) => {
                const updatedPreviews = [...prevPreviews];
                updatedPreviews[currentImageIndex] = newImageUrl;
                return updatedPreviews;
            });

            // Convert the blob to a new File object to replace the original image file
            const newFile = new File([blob], images[currentImageIndex].name, {
                type: images[currentImageIndex].type,
                lastModified: Date.now(),
            });

                // Update the images array with the new cropped file
            setImages((prevImages) => {
                const updatedImages = [...prevImages];
                updatedImages[currentImageIndex] = newFile;
                return updatedImages;
            });

            setCurrentImageIndex(null); // Close crop UI
            }
        });
        }
    }
    };

      //edit
    const handleEditClick = (data: ContentData) => {
    setEditFormData({
        ...data,
        category: data.category?._id ||''
      });
    setEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editValidation()) {
          const confirm = await editConfirm();
          if(!confirm) {return}
          
         const response = await editContent(editFormData as ContentData, searchFilterSortPagination)

        if(response.data){
            setEditModal(false)
            const data = response.data.data;
            setContentData(data.contents);
            setResult(data.contents);
            setTotal(data.total);
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
                Content
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
               
                <Pencil size={15}/>
                Add Content
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
                        className="peer h-full w-full rounded-[7px] border border-blue-gray-200 dark:border-gray-300 border-t-transparent bg-transparent dark:bg-darkGray px-3 py-2.5 !pr-9 font-sans text-sm font-normal text-blue-gray-700 dark:text-gray-200 outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-blue-gray-200 placeholder-shown:border-t-blue-gray-200 dark:placeholder-shown:border-gray-600 dark:placeholder-shown:border-t-gray-600 focus:border-2 focus:border-gray-900 dark:focus:border-gray-400 focus:border-t-transparent dark:focus:border-t-transparent focus:outline-0 disabled:border-0 disabled:bg-blue-gray-50 dark:disabled:bg-gray-700"
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

        {contentData.length || result.length ?(
            <>

            <DataTable 
            columns={columns} 
            data={result} 
            onSort={handleSort} 
            onDelete={handleDelete} 
            onListed={handleListing} 
            onEdit={handleEditClick}
            pageSize={pageSize}
            currentPage={currentPage}
            totalPage={totalPage}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            />
         
            {/* <div className="p-6 overflow-x-auto max-w-full">
            <table className="w-full mt-4 text-left border-collapse min-w-max rounded-lg shadow-md overflow-hidden  table-auto">
                
                <thead className="text-center bg-gray-100 dark:bg-darkGray ">
                <tr className="text-gray-700 dark:text-gray-300 text-sm">
                    {[ "ID","Title","Subtitle","Content","Category","Images", "Status","Created At","Action",].map((header, index) => (
                    <th key={index} className="p-4 border-b border-gray-300 dark:border-gray-700 cursor-pointer dark:hover:bg-gray-500 transition-colors"
                    onClick={() =>  header !== 'Action' ? handleSort(columnMap[header]) : null}>
                
                    <div className="flex items-center justify-center gap-2">
                        {header}
                        {["ID","Title","Subtitle", "Content","Category","Created At"].includes(header) && <ChevronsUpDown size={14} />}
                    </div> 
                    
                    </th>
                    ))}
                </tr>
                </thead>

              
                <tbody className="text-gray-800 dark:text-gray-200 text-sm">
                {result?.map((value, index) => (
                    <tr key={index} className="hover:bg-gray-100 dark:hover:bg-darkGray transition-all">
             
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                        <p className="font-medium">{value.id.slice(7, 16)}</p>
                    </td>

       
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                        <p className="truncate">{value.title}</p>
                    </td>

           
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700 max-w-[150px] whitespace-nowrap overflow-hidden text-ellipsis">
                        <p className="truncate">{value.subtitle}</p>
                    </td>

                    <td className="p-4 border-b border-gray-300 dark:border-gray-700 max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">
                        <p className="truncate">{value.content}</p>
                    </td>

    
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700">
                        <p>{value.category.name}</p>
                    </td>

     
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700">
                        <img src={value.image} alt="" className='w-12 h-12 object-cover rounded-md'/>
                    </td>


                    <td className="p-4 border-b border-gray-300 dark:border-gray-700">
                        <span
                        className={`px-3 py-1 text-xs font-bold rounded-md uppercase ${
                            value.isListed
                            ? "bg-green-500/20 text-green-300 dark:bg-green-300/2 "
                            : "bg-red-500/20 text-red-600 dark:bg-red-300/2 dark:text-red-400"
                        }`}
                        >
                        {value.isListed ? "Listed" : "Unlisted"}
                        </span>
                    </td>

           
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap">
                        <p>{value.createdAt}</p>
                    </td>

               
                    <td className="p-4 border-b border-gray-300 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                  
                        <button
                            className="px-4 py-1.5 text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-50 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                            onClick={() => handleListing(value.id, index)}
                        >
                            {value.isListed ? "Unlist" : "List"}
                        </button>

                       
                        <button
                            className="px-4 py-1.5 text-xs font-semibold uppercase border rounded-lg transition-all bg-red-500/20 text-red-600 dark:bg-red-400/2 dark:text-red-400 hover:bg-red-500/30 dark:hover:bg-red-500/40"
                            onClick={() => handleDelete(value.id)}
                        >
                            Delete
                        </button>

            
                        <button
                            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            onClick={() => handleEditClick(value)}
                        >
                            <Pencil size={18} />
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div> */}

            {/* bottom */}
            {/* <div className="flex items-center justify-between p-4  border-blue-gray-50 ">
                <p className="text-sm">
                    Page {currentPage} of {Math.ceil(totalPage / pageSize)}
                </p>
                <div className="flex gap-2 ">
                    <button 
                        onClick={handlePrevious} 
                        disabled={currentPage === 1}
                        className="select-none  dark:text-gray-50  rounded-lg border border-gray-900 dark:border-gray-50 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        >
                        Previous
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={currentPage >= Math.ceil(totalPage / pageSize)}
                        className="select-none rounded-lg border dark:text-gray-50  border-gray-900 dark:border-gray-50 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                        >  
                        Next
                    </button>
                </div>
           </div> */}
            </>
        ): <NoContent />}

        {/* modalCreate */}
        {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
            <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform scale-95 max-w-md w-full">
            <h1 className="text-center text-lg font-bold mb-4 text-darkGray">Create Content</h1>
            <form className="mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Title</label>
                <input
                    type="text"
                    name="title"
                    placeholder="Enter title"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleChange}
                    required
                />
                {errors?.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                </div>

                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Subtitle</label>
                <input
                    type="text"
                    name="subtitle"
                    placeholder="Enter subtitle"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleChange}
                    required
                />
                {errors?.subtitle && <span className="text-red-500 text-sm">{errors.subtitle}</span>}
                </div>

                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Content</label>
                <textarea
                    name="content"
                    placeholder="Write content"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleChange}
                    required
                />
                {errors?.content && <span className="text-red-500 text-sm">{errors.content}</span>}
                </div>

                {/* Category Dropdown */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Category</label>
                <select
                    name="category"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={(e) =>
                    setCreateFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    required
                >
                    <option value="">Select Category</option>
                    {category?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.name}
                    </option>
                    ))}
                </select>
                {errors?.category && <span className="text-red-500 text-sm">{errors.category}</span>}
                </div>

                {/* Image Upload */}
                <div className="flex flex-wrap justify-center gap-2">
                {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-16 h-16" onDoubleClick={() => handleImageClick(index)}>
                    <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-md"
                    />
                    <button
                        type="button"
                        className="absolute top-0 right-0 bg-customPink text-white text-center rounded-full h-5 w-5 hover:bg-red-600 flex items-center justify-center"
                        onClick={() => handleImageRemove(index)}
                    >
                        ✕
                    </button>
                    </div>
                ))}

                <label htmlFor="file-upload" className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-400 transition-all">
                    <Plus />
                </label>
                <input
                    id="file-upload"
                    name="images"
                    type="file"
                    className="hidden"
                    onChange={handleImageUpload}
                />
                </div>

                <p className="text-xs text-gray-500 text-center">
                Upload Image<br />
                Double click to resize the image
                </p>
                {errors?.image && <span className="text-red-500 text-sm">{errors.image}</span>}

                {/* Buttons Centered */}
                <div className="flex justify-center gap-4 mt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md"
                >
                    Create
                </button>
                <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 bg-lightGray text-black rounded-md"
                >
                    Cancel
                </button>
                </div>
            </form>
            </div>
        </div>
        )}

        {/* crop */}
        {currentImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-lg max-w-md">
            <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                onComplete={(c) => handleCropComplete(c)}
                aspect={1 / 1} // Adjust the aspect ratio as needed
            >
                <img
                ref={imageRef}
                src={imagePreviews[currentImageIndex]}
                alt="Crop preview"
                className="max-w-full max-h-[80vh] object-contain"
                />
            </ReactCrop>
            <button
                onClick={() => setCurrentImageIndex(null)}
                className="mt-4 w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
            >
                Cancel
            </button>
            </div>
        </div>
        )}

        {/* modalFilter */}
        {filterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
            <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform scale-95 max-w-md w-full">
            <h1 className="text-center text-lg font-bold mb-4 text-darkGray">Filter</h1>
            <form className="mx-auto flex flex-col gap-4 max-w-xs" onSubmit={handleFilter}>

                {/* Date Range Input */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Start Date</label>
                <input
                    type="date"
                    name="startDate"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleFilterChange}
                    required
                />
                </div>

                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">End Date</label>
                <input
                    type="date"
                    name="endDate"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleFilterChange}
                    required
                />
                {errors?.date && <span className="text-red-500 text-sm">{errors.date}</span>}
                </div>

                {/* Status Input */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Status</label>
                <select
                    name="status"
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={handleFilterChange}
                    required
                >
                    <option value="">Select Status</option>
                    <option value="-1">Unlisted</option>
                    <option value="1">Listed</option>
                </select>
                </div>

                {/* Buttons Centered */}
                <div className="flex justify-center gap-4 mt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md"
                >
                    Apply
                </button>
                <button
                    type="button"
                    onClick={() => setFilterModal(false)}
                    className="px-4 py-2 bg-lightGray rounded-md"
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
            <div className="bg-white p-6 rounded-lg shadow-lg transform transition-transform scale-95 max-w-md w-full">
            <h2 className="text-lg font-bold mb-4 text-darkGray text-center">Edit Content</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">

                {/* Title Input */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Title</label>
                <input
                    type="text"
                    name="title"
                    value={editFormData?.title || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, title: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors?.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                </div>

                {/* Subtitle Input */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Subtitle</label>
                <input
                    type="text"
                    name="subtitle"
                    value={editFormData?.subtitle || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, subtitle: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors?.subtitle && <span className="text-red-500 text-sm">{errors.subtitle}</span>}
                </div>

                {/* Category Dropdown */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Category</label>
                <select
                    name="category"
                    value={editFormData?.category || ""}
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, category: e.target.value })}
                >
                   <option value="" disabled>
                    {category.length > 0
                        ? category.find((cat) => cat.id === editFormData?.category)?.name || "No Category"
                        : "No Category"}
                    </option>
                    {category.length > 0 &&
                    category.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                        {cat.name}
                        </option>
                    ))}

                </select>

                {errors?.category && <span className="text-red-500 text-sm">{errors.category}</span>}
                </div>

                {/* Content Input */}
                <div>
                <label className="block text-sm font-medium mb-1 text-nightBlack">Content</label>
                <textarea
                    name="content"
                    value={editFormData?.content || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, content: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-darkGray h-28 resize-none"
                    required
                />
                {errors?.content && <span className="text-red-500 text-sm">{errors.content}</span>}
                </div>



                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-4">
                <button type="submit" className="px-4 py-2 bg-black text-white rounded-md">
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="px-4 py-2 bg-lightGray text-black rounded-md"
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

export default ContentTable