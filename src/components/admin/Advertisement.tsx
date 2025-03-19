'use client'
import React, {useState, useEffect, useRef} from 'react';
import ReactCrop, { Crop,} from "react-image-crop";
import { SlidersHorizontal, Plus, Search, Pencil } from 'lucide-react';
import { successToast } from '@/utils/toasts/toast';
import { createConfirm, deleteConfirm, editConfirm, listUnlistConfirm } from '@/utils/sweet_alert/sweetAlert';
import { useFetch } from '@/hooks/fetchHooks/useAdminFetch';
import { useAdvertisementCrud } from '@/hooks/crudHooks/admin/useAdvertisementCrud';
import NoContent from '../reusables/NoContent';
import DataTable from '../reusables/Table';
import { useDebounce } from '@/hooks/helperHooks/useDebounce';

interface AdvertisementData {
    id: string,
    title: string,
    subtitle: string,
    content:string,
    image?:string,
    isListed: boolean,
    createdAt: string,
}

interface createFormData {
    title: string,
    subtitle: string,
    content: string,
    image:File[],
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
  { key: "id", label: "ID", sortable: true },
  { key: "title", label: "Title", sortable: true },
  { key: "subtitle", label: "Subtitle", sortable: true },
  {key: 'image',
   label: 'Image',
   sortable: false,
 //  render:(item: ContentData) => item.image || ''
  },

  { 
    key: "isListed", 
    label: "Status", 
    sortable: false, 
    render: (item: AdvertisementData) => (item.isListed ? "Listed" : "Unlisted") 
  },
  { key: "createdAt", label: "Created At", sortable: true },
];


const AdvertisementTable: React.FC = () => {
    const [advertisementData, setAdvertisementData] = useState<AdvertisementData[]>([]);
    const [createModal, setCreateModal] = useState<boolean>(false);
    const [createFormData, setCreateFormData] = useState<createFormData>({title: '', subtitle:'', content:'', image:[]});
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
    
    const [crop, setCrop] = useState<Crop | undefined>();
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [errors, setErrors] = useState<Errors>({});

    const [searchValue, setSearchValue] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: keyof AdvertisementData; direction: 'desc' | 'asc' } | null>(null);
    const [filterOption, setFilterOption] = useState<FilterOption>({startDate: '', endDate: '', status: undefined});
   
    const [filterModal, setFilterModal] = useState<boolean>(false);
    const [filterStatus, setFilterStatus] = useState<boolean>(false);
    const [totalPage, setTotal] = useState<number>(0)
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageSize] = useState<number>(2);

    const [editModal, setEditModal] = useState<boolean>(false);
    const [editFormData, setEditFormData] = useState<AdvertisementData | null>(null);

    const [result, setResult] = useState<AdvertisementData[]>([]);
    const {getAdvertisementData} = useFetch();
    const {createAd, controllAdListing, editAd, deleteAd} = useAdvertisementCrud()

    const debouncedSearch = useDebounce(searchValue, 800);
    // const throttledFilters = useThrottle({filterOption, currentPage, pageSize, sortConfig}, 300)

    const searchFilterSortPagination = {
      search: debouncedSearch || '',
      startDate: filterOption.startDate || '',
      endDate: filterOption.endDate || '',
      status: filterOption.status ,
      sortColumn: sortConfig?.column || 'createdAt',
      sortDirection: sortConfig?.direction || 'desc',
      page:currentPage,
      pageSize: pageSize, 
    };


    useEffect(() => {
        fetchData();
    },[debouncedSearch, filterOption, currentPage, pageSize, sortConfig]);

    const fetchData = async () => {
        try {
            const response = await getAdvertisementData(searchFilterSortPagination);
            if(response.data){
              const advertisementData = response.data;
              setAdvertisementData(advertisementData.advertisement);
              setResult(advertisementData.advertisement);
              setTotal(advertisementData.total);
            };
            
        } catch (error) {
            console.error(error);
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(validation()){

            const confirm = await createConfirm();
            if(!confirm){return};

            const advertisementData = new FormData();
            advertisementData.append('title', createFormData.title);
            advertisementData.append('subtitle', createFormData.subtitle);
            advertisementData.append('content', createFormData.content);
            images.forEach((image: File) => {
              advertisementData.append('images', image); // 'images' is the field name you expect in the backend
            });

            const response = await createAd(advertisementData, searchFilterSortPagination);
            
            if(response.data){
                const advertisementData = response.data.data
                setAdvertisementData(advertisementData.advertisement);
                setResult(advertisementData.advertisement);
                setTotal(advertisementData.total);
                setCreateModal(false);
                setImagePreviews([])
                successToast('Successfully created')
            }
            
        }

    }

    const handleListing = async (advertisementId: string, index: number) => {
      const confirm = await listUnlistConfirm(!advertisementData[index].isListed);
      if(!confirm) { return }
      const response = await controllAdListing(advertisementId, searchFilterSortPagination);
      if(response.data){
        const advertisementData = response.data.data
        setAdvertisementData(advertisementData.advertisement);
        setResult(advertisementData.advertisement);
        setTotal(advertisementData.total);
      }

    }

    const handleDelete = async (advertisementId: string) => {
      const confirm = await deleteConfirm();
     
        if(!confirm){return}
        const response = await deleteAd(advertisementId, searchFilterSortPagination)

        if(response.data){
          const advertisementData = response.data.data
          setAdvertisementData(advertisementData.advertisement);
          setResult(advertisementData.advertisement);
          setTotal(advertisementData.total);
        }
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
      e.preventDefault();


      if (editValidation()) {
        const confirm = await editConfirm();
        if(!confirm){ return } 
       const response = await editAd(editFormData ? editFormData : {}, searchFilterSortPagination);

      if(response.data){
          setEditModal(false)
          const advertisementData = response.data.data
          setAdvertisementData(advertisementData.advertisement);
          setResult(advertisementData.advertisement);
          setTotal(advertisementData.total);
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
        setImagePreviews([]);
        setFilterOption({startDate: '', endDate: '', status: undefined})
    }

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
        
            newErrors.title = 'This field is required'
        }

        if(!editFormData?.subtitle.trim()){
            newErrors.subtitle = 'This field is required'
        }

        if(!editFormData?.content.trim()){
            newErrors.content = 'This field is required'
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0

    }

    const handleSort = (column: keyof AdvertisementData) => {
      setSortConfig((prev) => {
          const isSameColumn = prev?.column === column;
          return {
              column,
              direction: isSameColumn && prev?.direction === 'asc' ? 'desc' : 'asc',
          };
      });
    };

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
        };
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

    const handleEditClick = (data: AdvertisementData) => {
      setEditFormData(data);
      setEditModal(true);
    };



  return (
   
    <div className="relative flex flex-col w-full h-full text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray  bg-clip-border ">
        {/* head */}
        <div className="relative mx-4 mt-4 overflow-hidden text-gray-700 bg-white dark:bg-nightBlack dark:text-lightGray rounded-none bg-clip-border">
        <div className="flex items-center justify-between gap-8 mb-8">
            <div>
            <h5
                className="block font-sans text-2xl antialiased font-semibold leading-snug tracking-normal text-blue-gray-900 dark:text-lightGray">
                Advertisement
            </h5>

            </div>
            <div className="flex flex-col gap-2 shrink-0 sm:flex-row">

             <button
                className="select-none rounded-lg border flex gap-1 dark:text-lightGray dark:border-lightGray  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={ !filterStatus ? () => setFilterModal(true) : removeFilter}>
                 <SlidersHorizontal size={10}/>
                 { !filterStatus ?  "Filter" : 'Remove'}
             </button>
    
            <button
                className="flex select-none items-center gap-3 rounded-lg dark:text-darkGray dark:bg-lightGray bg-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-white shadow-md shadow-gray-900/10 transition-all hover:shadow-lg hover:shadow-gray-900/20 focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button" onClick={() => setCreateModal(true)} >
               
                <Pencil size={15}/>
                Add Advertisement
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

      {advertisementData.length || result.length ? (
        <>
        <DataTable 
          columns={columns} 
          data={result} 
          onListed={handleListing} 
          onEdit={handleEditClick} 
          onSort={handleSort} 
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPage={totalPage}
          pageSize={pageSize}
          handleNext={handleNext}
          handlePrevious={handlePrevious}
          />
      
        {/* <div className="p-6 px-0 overflow-x-auto">
          <table className="w-full mt-4 text-left border-collapse rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-100 dark:bg-darkGray text-gray-800 dark:text-gray-300 text-sm  tracking-wider">
              <tr>
                {["ID", "Title", "Subtitle", "Details", "Images", "Status", "Created At", "Action"].map((header, index) => (
                  <th
                    key={index}
                    className="p-4 border-b border-gray-300 dark:border-gray-700 text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                    onClick={() =>
                      header !== "Images" && header !== "Status" && header !== "Action"
                        ? handleSort(columnMap[header])
                        : null
                    }
                  >
                    <div className="flex items-center justify-center gap-2">
                      {header}
                      {["ID", "Title", "Subtitle", "Details", "Created At"].includes(header) && <ChevronsUpDown size={14} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-gray-800  dark:text-gray-200 text-sm">
              {result?.map((value: any, index: number) => (
                <tr key={index} className="border-b border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-darkGray transition-all">
                  <td className="p-4 text-center font-medium">{value.id.slice(7, 16)}</td>
                  <td className="p-4 text-center truncate max-w-[150px]">{value.title}</td>
                  <td className="p-4 text-center truncate max-w-[150px]">{value.subtitle}</td>
                  <td className="p-4 text-center truncate max-w-[200px]">{value.content}</td>
                  <td className="p-4 text-center">
                    <img src={value.image} alt="" className="w-12 h-12 rounded-lg shadow-md object-cover" />
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-md uppercase ${
                        value.isListed
                          ? "bg-green-500/20 text-green-600 dark:bg-green-400/20 dark:text-green-300"
                          : "bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-300"
                      }`}
                    >
                      {value.isListed ? "Listed" : "Unlisted"}
                    </span>
                  </td>
                  <td className="p-4 text-center">{value.createdAt}</td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      className="px-4 py-1.5 text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
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
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> */}

        {/* <div className="flex items-center justify-between p-4  border-blue-gray-50">
            <p className="text-sm">
                Page {currentPage} of {Math.ceil(totalPage / pageSize)}
            </p>
            <div className="flex gap-2">
                <button 
                    onClick={handlePrevious} 
                    disabled={currentPage === 1}
                    className="select-none rounded-lg border dark:border-gray-50 dark:text-gray-50  border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
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
        ): <NoContent message='No advertisements available'/>}


        {/* modalCreateEmployee */}
        {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-md shadow-lg max-w-md w-full border dark:border-gray-700">
            <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Create Advertisement
            </h1>

            <form className="mx-auto max-w-xs flex flex-col gap-3" onSubmit={handleSubmit}>
              {/* Title */}
              <div>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                  onChange={handleChange}
                />
                {errors?.title && <span className="text-red-500 text-xs">{errors.title}</span>}
              </div>

              {/* Subtitle */}
              <div>
                <input
                  type="text"
                  name="subtitle"
                  placeholder="Enter subtitle"
                  className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                  onChange={handleChange}
                />
                {errors?.subtitle && <span className="text-red-500 text-xs">{errors.subtitle}</span>}
              </div>

              {/* Content */}
              <div>
                <textarea
                  name="content"
                  placeholder="Write content"
                  className="border p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white transition"
                  rows={3}
                  onChange={handleChange}
                />
                {errors?.content && <span className="text-red-500 text-xs">{errors.content}</span>}
              </div>

              {/* Image Upload */}
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index}`}
                      className="w-16 h-16 object-cover rounded-md border dark:border-gray-700 shadow-md"
                      onDoubleClick={() => handleImageClick(index)}
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

                {/* Upload Button */}
                <label
                  htmlFor="file-upload"
                  className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-md flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-400 dark:hover:bg-gray-600 transition-all shadow-md"
                >
                  <Plus />
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
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border dark:border-gray-700">
              <h1 className="text-center text-xl font-semibold text-gray-900 dark:text-white">Filter</h1>

              <form className="mx-auto max-w-xs flex flex-col gap-4" onSubmit={handleFilter}>
                {/* Date Range Input */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    onChange={handleFilterChange}
                  />
                  {errors && <span className="text-red-500 text-sm mt-1">{errors.date}</span>}
                </div>

                {/* Status Input */}
                <div className="flex flex-col">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    name="status"
                    className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    onChange={handleFilterChange}
                  >
                    <option value="">Select Status</option>
                    <option value="-1">Unlisted</option>
                    <option value="1">Listed</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-3">
                  <button
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-900 transition focus:ring-2 focus:ring-blue-400 text-sm"
                    type="submit"
                  >
                    Apply
                  </button>

                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition focus:ring-2 focus:ring-gray-300 text-sm"
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
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full border dark:border-gray-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Advertisement</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Title Input */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                <input
                    type="text"
                    name="title"
                    value={editFormData?.title || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, title: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                {errors?.title && <span className="text-red-500 text-xs">{errors.title}</span>}
                </div>

                {/* Subtitle Input */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</label>
                <input
                    type="text"
                    name="subtitle"
                    value={editFormData?.subtitle || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, subtitle: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                {errors?.subtitle && <span className="text-red-500 text-xs">{errors.subtitle}</span>}
                </div>

                {/* Content Textarea */}
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                <textarea
                    name="content"
                    value={editFormData?.content || ""}
                    onChange={(e) => setEditFormData((prev) => prev && { ...prev, content: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 h-24 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    required
                />
                {errors?.content && <span className="text-red-500 text-xs">{errors.content}</span>}
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-slate-900 transition focus:ring-2 focus:ring-blue-400 text-sm"
                >
                    Save
                </button>
                <button
                    type="button"
                    onClick={() => setEditModal(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition focus:ring-2 focus:ring-gray-300 text-sm"
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

export default AdvertisementTable