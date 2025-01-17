'use client'
import React, {useState, useEffect, useRef} from 'react';
import ReactCrop, { Crop,} from "react-image-crop";
import { ChevronsUpDown, SlidersHorizontal, UserPlus, Plus, Search, Pencil, Rewind, Delete } from 'lucide-react';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, successToast } from '@/utils/toasts/toats';


interface EventData {
    _id: string,
    title: string,
    description: string,
    image: string[],
    location: string,
    locationURL: string,
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
  

const EventTable: React.FC = () => {
    const [eventData, setEventData] = useState<EventData[]>([]);
    const [createModal, setCreateModal] = useState<Boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({title: '', description:'', image:[], location:'', locationURL: '', eventDate:''});
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const [crop, setCrop] = useState<Crop | undefined>();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof EventData; direction: 'asc' | 'desc' } | null>(null);

    const [filterModal, setFilterModal] = useState<Boolean>(false);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});
    const [filterData, setFilterData] = useState<EventData[]>([]);
    const [filterStatus, setFilterStatus] = useState<Boolean>(false);

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(2);

    const [editModal, setEditModal] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<EventData | null>(null);

    const [result, setResult] = useState<EventData[]>([]);
    const {handleRequest} = useAxios();

    useEffect(() => {
        fetchData();
    },[]);

    useEffect(() => {
       setResult(
          searchValue ? filterData.filter(event =>
            event.title?.toLowerCase().includes(searchValue.toLowerCase())
          ): filterData
        )
    },[searchValue, filterData]);


    const fetchData = async () => {
        try {
            const response = await handleRequest({
                url:'/api/admin/events',
                method:'GET'
            })
            if(response.error){
                errorToast(response.error)
            }
            if(response.data){
                const data = response.data;
                console.log(data);
                setEventData(data);
                setFilterData(data);
                setResult(data);
            }
            
        } catch (error) {
            errorToast('something happen')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
            const data = new FormData();
            data.append('title', createFormData.title);
            data.append('description', createFormData.description);
            images.forEach((image: File) => {
                data.append('images', image);
            });
            data.append('location', createFormData.location);
            data.append('locationURL', createFormData.locationURL);
           data.append('eventDate', createFormData.eventDate);

            console.log(data,'lll')
            const response = await handleRequest({
                url: '/api/admin/events',
                method:'POST',
                data: data,
                headers:{
                    'Content-Type': 'multipart/form-data', 
                }
            })

            if(response.error){
                errorToast(response.error)
            }

            if(response.data){
                setResult([])
                setCreateModal(false);
                setImagePreviews([])
                successToast('Successfully created')
            }
            
        }else{
            console.log('oops')
        }

    }

    const handleCancel = () => {
        setCreateModal(false);
        setErrors({});
        setImagePreviews([])
    }


    const handleDelete = async (id: string) => {
        const response = await handleRequest({
            url:'/api/admin/events',
            method:'DELETE',
            data:{
                id:id
            }
        });

        if(response.error){
            errorToast(response.error)
        }

        if(response.data){
            setResult(response.data)
        }
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
              } catch (e) {
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
              } catch (e) {
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
    
        const filtered = eventData.filter((ev) => {
            // Clone dates to avoid mutation
            const contentDate = new Date(ev.createdAt);
            contentDate.setHours(0, 0, 0, 0);
    
            const startClone = start ? new Date(start) : null;
            const endClone = end ? new Date(end) : null;
    
            if (startClone) startClone.setHours(0, 0, 0, 0);
            if (endClone) endClone.setHours(0, 0, 0, 0);
    
          
            const isWithinDateRange = 
                (!startClone || contentDate >= startClone) &&
                (!endClone || contentDate <= endClone);
    
            // Check if employee status matches
            // const isStatusMatch = status === undefined ;
    
            return isWithinDateRange //&& isStatusMatch;
        });
    
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
        setFilterData(eventData);
    }

//pagination

    const paginatedData = result?.slice(
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
      const handleEditClick = (data: EventData) => {
        setEditFormData(data);
        setEditModal(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editValidation()) {
         const response = await handleRequest({
            url:'/api/admin/events',
            method:'PATCH',
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
                Events
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
                    <ChevronsUpDown size={13} onClick={() => handleSort('_id')}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Title
                    <ChevronsUpDown size={13} onClick={() => handleSort('title')}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                    Description
                    <ChevronsUpDown size={13} onClick={() => handleSort('description')}/>
                </p>
                </th>
                
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                        Location
                    <ChevronsUpDown size={13}/>
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                     Images
                </p>
                </th>
                <th
                className="p-4 transition-colors cursor-pointer border-y border-blue-gray-100 bg-blue-gray-50/50 hover:bg-blue-gray-50">
                <p
                    className="flex items-center justify-between gap-2 font-sans text-sm antialiased font-normal leading-none text-blue-gray-900 opacity-70">
                     Event Date
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

            {paginatedData?.map((value, index) => {
            return(
            <tr key={index}>
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p
                        className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900 opacity-70">
                        {value._id.split('').slice(7,16).join("")}
                    </p>
                    </div>
                </div>
                </td>
                <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {value.title}
                    </p>

                    </div>
                </div>
                </td>

                <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {value.description}
                    </p>

                    </div>
                </div>
                </td>
                <td className="p-4">
                 <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        {value.location}
                    </p>
                    <a href={value.locationURL} target='blank' className='font-bold'>view</a>
                    </div>
                 </div>
                </td>
                <td className="p-4">
                 <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                    <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                        <img src={value.image[0]} alt="" className='w-10 h-10'/>
                    </p>

                    </div>
                 </div>
                </td>
                <td className="p-4">
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {new Date(value.eventDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0) ? 'expired': new Date(value.eventDate).toLocaleDateString()}
                </p>
                
                </td>

                <td className="p-4">
                <p className="block font-sans text-sm antialiased font-normal leading-normal text-blue-gray-900">
                    {new Date(value.createdAt).toLocaleDateString()}
                </p>
                
                </td>
                <td className="p-4">
                <button
                    className="relative ml-2 h-10 max-h-[40px] w-24 max-w-[70px] select-none rounded-lg text-center align-middle font-sans text-xs font-medium uppercase text-gray-900 transition-all hover:bg-gray-900/10 active:bg-gray-900/20 disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none border dark:border-lightGray dark:bg-lightGray dark:text-darkGray "
                    type="button"
                    onClick={() => handleDelete(value._id)}
                    >
                        <span className="absolute  transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:text-darkGray">
                            Delete
                        </span>
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
                <h1 className="text-center text-xl font-semibold">Create Event</h1>
                <form className="mx-auto max-w-xs flex flex-col gap-4" onSubmit={handleSubmit}>

                    <div className="mt-1">
                    <div className="flex flex-col">
                        <input
                        type="text"
                        name="title"
                        placeholder="Enter title"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.title && (
                        <span className="text-red-500 text-sm mt-1">{errors.title}</span>
                        )}
                    </div>
                    </div>

                    <div className="mt-1">
                    <div className="flex flex-col">
                        <input
                        type="text"
                        name="location"
                        placeholder="Enter location"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.location && (
                        <span className="text-red-500 text-sm mt-1">{errors.location}</span>
                        )}
                    </div>
                    </div>

                    <div className="mt-1">
                    <div className="flex flex-col">
                        <input
                        type="text"
                        name="locationURL"
                        placeholder="Enter locationURL"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.locationURL && (
                        <span className="text-red-500 text-sm mt-1">{errors.locationURL}</span>
                        )}
                    </div>
                    </div>

                    <div className="mt-1">
                    <div className="flex flex-col">
                        <input
                        type="date"
                        name="eventDate"
                        placeholder="Enter eventDate"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.eventDate && (
                        <span className="text-red-500 text-sm mt-1">{errors.eventDate}</span>
                        )}
                    </div>
                    </div>

                    <div className="mt-1">
                    <div className="flex flex-col">
                        <textarea
                        name="description"
                        placeholder="write description"
                        className="border p-1 rounded-md"
                        onChange={handleChange}
                        />
                        {errors && errors.description && (
                        <span className="text-red-500 text-sm mt-1">{errors.description}</span>
                        )}
                    </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                    <div className="flex flex-wrap gap-2 mt-4">
                        {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative" onDoubleClick={() => handleImageClick(index)}>
                            <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="w-16 h-16 object-cover rounded-md"
                            />
                            <button
                            className="absolute top-0 right-0 bg-customPink text-white text-center rounded-full h-5 w-5 hover:bg-red-600 flex items-end justify-center"
                            onClick={() => handleImageRemove(index)}
                            >
                            <span>x</span>
                            </button>
                        </div>
                        ))}
                    {/* </div> */}
                    <label htmlFor="file-upload" className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-400 transition-all">
                        <Plus/>
                    </label>
                    {errors.image && <span className='text-red-500'>{errors.image}</span>}
                    <input 
                    id="file-upload" 
                    name='image' 
                    type="file"
                    className="hidden" 
                    onChange={handleImageUpload}
                    />

                    </div>
                    <p className="text-xs text-gray-500 text-center dark:text-gray-400"> Upload Image<br></br>
                        Double click to resize the image
                    </p>
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
                {/* <div className="mt-2 flex flex-col">
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
                </div> */}

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
            <h2 className="text-lg font-bold mb-4 text-darkGray">Edit Advertisement</h2>
            <form onSubmit={handleEditSubmit}>
                <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-nightBlack">title</label>
                <input
                    type="text"
                    name='title'
                    value={editFormData?.title || ''}
                    onChange={(e) =>
                    setEditFormData((prev) => prev && { ...prev, title: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors.title && <span className='text-red-500'>{errors.title}</span>}

                <label className="block text-sm font-medium mb-1 text-nightBlack">location</label>
                <input
                    type="text"
                    name='location'
                    value={editFormData?.location || ''}
                    onChange={(e) =>
                    setEditFormData((prev) => prev && { ...prev, location: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors.location && <span className='text-red-500'>{errors.location}</span>}
                <label className="block text-sm font-medium mb-1 text-nightBlack">locationURL</label>
                <input
                    type="text"
                    name='locationURL'
                    value={editFormData?.locationURL || ''}
                    onChange={(e) => 
                        setEditFormData((prev) => prev && { ...prev, locationURL: e.target.value })
                     }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors.locationURL && <span className='text-red-500'>{errors.locationURL}</span>}
                <label className="block text-sm font-medium mb-1 text-nightBlack"></label>
                <input
                    type="date"
                    name="eventDate"
                    value={
                        editFormData?.eventDate 
                            ? new Date(editFormData.eventDate).toISOString().split('T')[0] 
                            : ''
                    }
                    onChange={(e) =>
                        setEditFormData((prev) => prev && { ...prev, eventDate: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
                {errors.eventDate && <span className='text-red-500'>{errors.eventDate}</span>}
                <label className="block text-sm font-medium mb-1 text-nightBlack">description</label>
                <input
                    type="text"
                    name='description'
                    value={editFormData?.description || ''}
                    onChange={(e) =>
                    setEditFormData((prev) => prev && { ...prev, description: e.target.value })
                    }
                    className="w-full border rounded-md px-3 py-2 text-darkGray"
                    required
                />
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
                    className="px-4 py-2 bg-lightGray rounded-md"
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