'use client'
import React, {useState, useEffect, useRef} from 'react';
import ReactCrop, { Crop,} from "react-image-crop";
import {SlidersHorizontal, Search, Pencil } from 'lucide-react';
import { errorToast, successToast } from '@/utils/toasts/toast';
import { createConfirm, deleteConfirm, editConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { useEventCrud } from '@/hooks/crudHooks/admin/useEventCrud';
import DataTable from '../reusables/Table';
import NoContent from '../reusables/NoContent';

interface EventData {
    _id: string,
    title: string,
    description: string,
    image: string[],
    location: string,
    locationURL: string,
    slots: number,
    totalEntries: number,
    price: number,
    eventDate: string,
    createdAt: string,
}

interface createFormData {
    title: string,
    description: string,
    image: File[],
    location: string,
    locationURL: string,
    eventDate: string,
    slots: number,
    price: number,
}

interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
}

interface Errors {
    title?: string,
    description?:string,
    location?: string,
    image?: string,
    locationURL?: string,
    slots?: string,
    price?: string,
    eventDate?: string,
    startDate?: string,
    endDate?: string,
    date?: string,
}

interface PixelCrop {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  
interface CustomCrop extends Crop {
aspect?: number;
}

 const columns = [
    { key: "_id", label: "ID", sortable: true },
    { key: "title", label: "Title", sortable: true },
    { key: "description", label: "Description", sortable: false },
    { key: "image", label: "Images", sortable: false },
    { key: "location", label: "Location", sortable: true },
    { key: "eventDate", label: "Event Date", sortable: true },
    { key: "createdAt", label: "Created At", sortable: true },
 ];


const EventTable: React.FC = () => {
    const [eventData, setEventData] = useState<EventData[]>([]);
    const [createModal, setCreateModal] = useState<boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({title: '', description:'', image:[], location:'', locationURL: '', eventDate:'', slots:-Infinity, price:-Infinity});
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const [crop, setCrop] = useState<Crop | undefined>();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof EventData; direction: 'asc' | 'desc' } | null>(null);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});

    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(2);
    const [totalPage, setTotal] = useState<number>(0);

    const [editModal, setEditModal] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<EventData | null>(null);

    const [result, setResult] = useState<EventData[]>([]);
    const {getEventData} = useFetch();
    const {createEvent, deleteExistingEvent, editEvent} = useEventCrud()


    

    useEffect(() => {
        fetchData();
    }, [searchValue, filterOption, currentPage, pageSize, sortConfig]);

    const fetchData = async () => {
        try {
            const response = await getEventData({
                search: searchValue || '',
                startDate: filterOption.startDate || '',
                endDate: filterOption.endDate || '',
                status: filterOption.status,
                sortColumn: sortConfig?.column || 'createdAt',
                sortDirection: sortConfig?.direction || 'asc',
                page: currentPage,
                pageSize: pageSize,
            })

            if(response.data){
                const data = response.data;
                setEventData(data.events);
                setResult(data.events);
                setTotal(data.total)
            }
            
        } catch (error) {
            console.error(error)
            errorToast('something happen')
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
       
        if(validation()){
            const confirm = await createConfirm();
            if(!confirm){return};

            const eventData = new FormData();
            eventData.append('title', createFormData.title);
            eventData.append('description', createFormData.description);
            images.forEach((image: File) => {
                eventData.append('images', image);
            });
            eventData.append('location', createFormData.location);
            eventData.append('locationURL', createFormData.locationURL);
            eventData.append('eventDate', createFormData.eventDate);
            eventData.append('slots', createFormData.slots.toString());
            eventData.append('price', createFormData.price.toString());
            
            const response = await createEvent(eventData)

            if(response.data){
                setResult(response.data)
                setCreateModal(false);
                setImagePreviews([])
                successToast('Successfully created')
            }
            
        }
    };

    const handleDelete = async (eventId: string) => {
        const confirm = await deleteConfirm();
        if(!confirm){return};
        const response = await deleteExistingEvent(eventId);

        if(response.data){
            setResult(response.data)
        };
    };


    //edit
    const handleEditClick = (data: EventData) => {
    setEditFormData(data);
    setEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editValidation()) {

        const confirm = await editConfirm();
        if(!confirm ){return}
        const response = await editEvent(editFormData ? editFormData : {})

        if(response.data){
            setEditModal(false)
            setResult(response.data);
            successToast('Event updated successfully');
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
        setImagePreviews([])
    }

    const validation = () => {
        const newErrors: Errors = {};
        
          if(!createFormData.title.trim()){
            newErrors.title = 'This field is required'
          }

          if(!createFormData.description.trim()){
            newErrors.description = "This field is required"
          }

          if(!createFormData.location.trim()) {
            newErrors.location = 'This field is required'
          }

          if(!createFormData.locationURL.trim()) {
            newErrors.locationURL = 'This field is required'
          } else {
            try {
                new URL(createFormData.locationURL);
              } catch (error) {
                console.error(error);
                newErrors.locationURL = "Invalid URL";
              }          
          }

          if(!createFormData.eventDate.trim()){
            newErrors.eventDate = 'This field is required'
          }else if (new Date(createFormData.eventDate).setHours(0,0,0,0) <= new Date().setHours(0,0,0,0)){4
            newErrors.eventDate = 'choose an future date'
          }          

          if (images.length < 1){
            newErrors.image = 'minimum 1 image is required'
          }


          if(createFormData.slots <= 0){
            newErrors.slots = 'minimum 2 entries required'
          }else if(!createFormData.slots.toString().trim()){
            newErrors.slots = 'This is field is required'
          }

          if(createFormData.price <= 0){
            newErrors.price= 'price should be above zero'
          }else if(!createFormData.price.toString().trim()){
            newErrors.price = 'This is field is required'
          }

          setErrors(newErrors);
          return Object.keys(newErrors).length === 0;
        
    }

    const editValidation = () => {
        const newErrors: Errors = {};

        if(!editFormData?.title.trim()){
            newErrors.title = 'This field is required'
        }

        if(!editFormData?.description.trim()){
            newErrors.description = 'This field is required'
        }

        if(!editFormData?.location.trim()){
            newErrors.location = 'This field is required'
        }

        if(!editFormData?.locationURL.trim()){
            newErrors.locationURL = 'This field is required'
        } else {
            try {
                new URL(editFormData.locationURL);
              } catch (error) {
                console.error(error)
                newErrors.locationURL = "Invalid URL";
              }          
          }

        if(!editFormData?.eventDate.trim()){
            newErrors.eventDate = 'This field is required'
          }else if (new Date(editFormData.eventDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0)){4
            newErrors.eventDate = 'choose an future date'
          }   

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0

    }

    const handleSort = (column: keyof EventData) => {
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


  return (

        <div className="relative flex flex-col w-full h-full text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray bg-clip-border">
            {/* head */}
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray rounded-none bg-clip-border">
        <div className="flex items-center justify-between gap-8 mb-8">
            <div>
            <h5
                className="block font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900 dark:text-lightGray">
                Events
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
               
                <Pencil size={15}/>
                Add Event
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
        
    {result.length ? (  
            <>
            <DataTable
            columns={columns}
            data={result}
            onSort={handleSort}
            onDelete={handleDelete}
            onEdit={handleEditClick}
            currentPage={currentPage}
            pageSize={pageSize}
            totalPage={totalPage}
            handleNext={handleNext}
            handlePrevious={handlePrevious}
            />
       {/* <div className="p-6 px-0 overflow-x-auto">
        <table className="w-full mt-4 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-darkGray text-gray-800 dark:text-gray-300 text-sm tracking-wider">
            <tr>
            {['ID', 'Title', 'Description', 'Location', 'Images', 'Event Date', 'Created At', 'Action'].map((header, index) => (
                <th key={index} className="p-4 border-b border-gray-300 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    onClick={() => 
                        ['ID', 'Title', 'Description', 'Location', 'Event Date', 'Created At'].includes(header) ? handleSort(columnMap[header]) : null
                    }>
                    <div className="flex items-center justify-center gap-2">
                        {header}
                        {['ID', 'Title', 'Description', 'Location', 'Event Date', 'Created At'].includes(header) && <ChevronsUpDown size={14} />}
                    </div>
                </th>
            ))}
            </tr>
            </thead>

            <tbody className="text-gray-800 dark:text-gray-200 text-sm">
            {result?.map((value, index) => (
            <tr key={index} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-darkGray transition-all">
                <td className="p-4 text-center font-medium">{value._id.slice(7, 16)}</td>
                <td className="p-4 text-center truncate max-w-[150px]">{value.title}</td>
                <td className="p-4 text-center truncate max-w-[200px]">{value.description}</td>
                <td className="p-4 text-center">
                    <p>{value.location}</p>
                    <a href={value.locationURL} target='_blank' className='font-bold text-blue-500 hover:underline'>View</a>
                </td>
                <td className="p-4 text-center">
                    <img src={value.image[0]} alt="event" className='w-10 h-10 rounded-md'/>
                </td>
                <td className="p-4 text-center">
                    {new Date(value.eventDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'Expired' : new Date(value.eventDate).toLocaleDateString()}
                </td>
                <td className="p-4 text-center">{new Date(value.createdAt).toLocaleDateString()}</td>
                <td className="p-4 flex justify-center gap-3">
                    <button className="px-4 py-1.5 text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => handleDelete(value._id)}>
                        Delete
                    </button>
                    <button className='ml-3' onClick={() => handleEditClick(value)}>
                        <Pencil size={18} />
                    </button>
                </td>
            </tr>
            ))}
            </tbody>
        </table>
        </div>

        <div className="flex items-center justify-between p-4  border-blue-gray-50">
            <p className="text-sm">
                Page {currentPage} of {Math.ceil(totalPage / pageSize)}
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
       </>
    ):<NoContent message='No events scheduled'/>}

        {/* modalCreateEmployee */}
        {createModal && (
            <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl max-w-md w-full border dark:border-gray-700 max-h-[80vh] overflow-y-auto scrollable-container">
                <h1 className="text-center text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Create Event
                </h1>

                <form className="mx-auto flex flex-col gap-4" onSubmit={handleSubmit}>
                {/* Input Fields */}
                {[
                    { name: "title", placeholder: "Enter title" },
                    { name: "location", placeholder: "Enter location" },
                    { name: "locationURL", placeholder: "Enter location URL" },
                    { name: "eventDate", type: "date" },
                    { name: "slots", placeholder: "Enter number of slots", type: "number" },
                    { name: "price", placeholder: "Enter price", type: "number" }
                ].map(({ name, placeholder, type = "text" }) => (
                    <div key={name}>
                    <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                        onChange={handleChange}
                    />
                    {errors?.[name as keyof Errors] && <span className="text-red-500 text-xs">{errors[name as keyof Errors]}</span>}
                    </div>
                ))}

                {/* Description */}
                <div>
                    <textarea
                    name="description"
                    placeholder="Write description"
                    className="w-full border p-2 rounded-md focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                    rows={3}
                    onChange={handleChange}
                    />
                    {errors?.description && <span className="text-red-500 text-xs">{errors.description}</span>}
                </div>

                {/* Image Upload */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                    {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                        <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="w-16 h-16 object-cover rounded-md border-2 border-gray-300 dark:border-gray-700 shadow-md"
                        />
                        <button
                        type="button"
                        className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                        onClick={() => handleImageRemove(index)}
                        >
                        ✕
                        </button>
                    </div>
                    ))}
                    <label
                    htmlFor="file-upload"
                    className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md"
                    >
                    +
                    </label>
                    <input id="file-upload" name="image" type="file" className="hidden" onChange={handleImageUpload} />
                </div>
                <p className="text-xs text-gray-500 text-center dark:text-gray-400">
                    Upload Image <br /> Double click to resize the image
                </p>
                {errors?.image && <span className="text-red-500">{errors.image}</span>}

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

        {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg transform transition-transform scale-95 w-full max-w-md border dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Advertisement</h2>

            <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                {/* Title Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input
                    type="text"
                    name="title"
                    value={editFormData?.title || ""}
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, title: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                    />
                    {errors.title && <span className="text-red-500 text-sm">{errors.title}</span>}
                </div>

                {/* Location Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input
                    type="text"
                    name="location"
                    value={editFormData?.location || ""}
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, location: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                    />
                    {errors.location && <span className="text-red-500 text-sm">{errors.location}</span>}
                </div>

                {/* Location URL Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location URL</label>
                    <input
                    type="text"
                    name="locationURL"
                    value={editFormData?.locationURL || ""}
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, locationURL: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                    />
                    {errors.locationURL && <span className="text-red-500 text-sm">{errors.locationURL}</span>}
                </div>

                {/* Event Date Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date</label>
                    <input
                    type="date"
                    name="eventDate"
                    value={editFormData?.eventDate ? new Date(editFormData.eventDate).toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, eventDate: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                    />
                    {errors.eventDate && <span className="text-red-500 text-sm">{errors.eventDate}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Slots</label>
                    <input
                        type="number"
                        name="slots"
                        value={editFormData?.slots}
                        onChange={(e) =>
                            setEditFormData((prev) => prev && { ...prev, slots: Number(e.target.value) })
                        }
                        className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    {errors.slots && <span className="text-red-500 text-sm">{errors.slots}</span>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={editFormData?.price}
                        onChange={(e) =>
                            setEditFormData((prev) => prev && { ...prev, price: Number(e.target.value) })
                        }
                        className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                    {errors.price && <span className="text-red-500 text-sm">{errors.price}</span>}
                </div>

                {/* Description Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                    <input
                    type="text"
                    name="description"
                    value={editFormData?.description || ""}
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, description: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                    />
                </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-black text-white rounded-md hover:bg-slate-900 transition focus:ring-2 focus:ring-blue-400 text-sm"
                >
                    Save
                </button>

                <button
                    type="button"
                    onClick={() => setEditModal(false)}
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

export default EventTable