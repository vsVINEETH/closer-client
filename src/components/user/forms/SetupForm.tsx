'use client'
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactCrop, { Crop,} from "react-image-crop";
import { login } from '@/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import {  successToast } from '@/utils/toasts/toast';
import { Plus } from 'lucide-react';
import WebcamCapture from "@/components/Webcam";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { setupFormSchema, MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/schemas/user/setupSchema';
import { z } from "zod";
import { useUserInteractions } from '@/hooks/crudHooks/user/useUserInteractions';


interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CustomCrop extends Crop {
  aspect?: number;
}
interface CapturedImage {
  id: string;
  file: File;
  previewUrl: string;
}

type SetupFormData = z.infer<typeof setupFormSchema>;

const SetupForm: React.FC = () => {
  const { register, handleSubmit, setValue, setError, formState: { errors }, clearErrors} = useForm<SetupFormData>({ resolver: zodResolver(setupFormSchema),  
    defaultValues: {
    images: [],
  },});

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [crop, setCrop] = useState<Crop | undefined>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);


  const {setupAccount} = useUserInteractions()
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() =>{
    const newFiles = capturedImages.map((img) => img.file);
    const newPreviews = capturedImages.map((img) => img.previewUrl);

    setImages((prevImages) => [...prevImages, ...newFiles]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  },[capturedImages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {

    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files || []);

    if (newFiles.length) {
      setValue("images", [...images, ...newFiles], { shouldValidate: true });
    }
  
    const validFiles = newFiles.filter((file) => 
      file.size <= MAX_FILE_SIZE && ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
  
    if (validFiles.length < newFiles.length) {
      setError("images", { message: "Invalid file type or size" });
      return;
    }
  
    const updatedImages = [...images, ...validFiles];
  
    if (updatedImages.length < 2) {
      setError("images", { message: "Minimum 2 images are required" });
    } else {
      clearErrors("images");
    }

    setImages(updatedImages);
    setImagePreviews(updatedImages.map((file) => URL.createObjectURL(file)));

  }

  const handleImageRemove = (index: number) => {
    if(imagePreviews.length === 0){
      setCurrentImageIndex(null);
    } 

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  
    setValue(
      "images",
       images.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setCrop({ aspect: 1 / 1 }  as CustomCrop); 
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

  const onSubmit = async (data: SetupFormData) => {

      const email = localStorage.getItem('email');
      const formData = new FormData();
    
      formData.append('email', email || ''); 
      formData.append('dob', data.dob);
      formData.append('gender', data.gender);
      formData.append('interestedIn', data.interest);
      formData.append('lookingFor', data.lookingFor);
      images.forEach((image: File) => {
        formData.append('images', image);
      });

      const response = await setupAccount(formData);

      if(response.data){
       const user = response.data;
        dispatch(
          login({ id:user.id, username:user.username, 
            email: user.email, image: user.image, phone: user.phone, 
            birthday: user.dob, lookingFor: user.lookingFor,
            interestedIn: user.interestedIn,
          })
        );
        successToast('Account created successfully')
        router.push('/user/home');
      }

  }

  const handleInputChange = () => {
    clearErrors();
  };

  return (
    <div className="max-w-4xl bg-white dark:bg-darkGray dark:border-darkGray border shadow-md sm:rounded-lg flex flex-col lg:flex-row p-4 lg:p-8 w-full">
    <div className="lg:w-2/3 space-y-4">
      <h1 className="text-center text-2xl font-extrabold text-customPink dark:text-lightGray">Set up Account</h1>
      <form className="space-y-3"
        onSubmit={handleSubmit(onSubmit)}
          >
          <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-2 space-y-2 lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-1">
              <label className="text-gray-500 text-sm dark:text-lightGray">Birthday {errors.dob && <span className='text-red-500'>{ errors.dob.message }</span>}</label>
                   
                <input 
                  type="date" 
                  id="date" 
                  {...register("dob")}
                  className="p-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-customPink dark:focus:ring-lightGray"
                  onChange={handleInputChange}
                />
            
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-500 text-sm dark:text-lightGray">Gender{errors.gender && <span className='text-red-500'> { errors.gender.message }</span>}</label>
            <div className="flex space-x-2 text-gray-500">
                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  value="male" 
                  className="mr-2" 
                  {...register("gender")}
                  onChange={handleInputChange}
                  />
                  Male
                </label>


                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio"  
                  value="female" 
                  {...register("gender")}
                  className="mr-2" 
                  onChange={handleInputChange}
                  />
                  Female
                </label>

                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  {...register("gender")}
                  value="others" 
                  className="mr-2" 
                  onChange={handleInputChange}
                  />
                  Other
                </label>

                
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-500 text-sm dark:text-lightGray">Interested in {errors.interest && <span className='text-red-500'>{ errors.interest.message }</span>}</label>
            <div className="flex space-x-2 text-gray-500">
                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  {...register("interest")}
                  value="male" 
                  className="mr-2"
                  onChange={handleInputChange} 
                  />
                  Male
                </label>


                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  {...register("interest")}
                  value="female" 
                  className="mr-2"
                  onChange={handleInputChange} 
                  />
                  Female
                </label>

                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  {...register("interest")}
                  value="others" 
                  className="mr-2" 
                  onChange={handleInputChange}
                  />
                  Other
                </label>

            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="lookingFor" className="text-gray-500 text-sm dark:text-lightGray">Looking for {errors.lookingFor && <span className='text-red-500'>{ errors.lookingFor.message }</span>}</label>
              <select 
              id="lookingFor"
              {...register("lookingFor")}
              defaultValue=''
              className="p-2 
              border 
              text-gray-500 
              border-gray-300 
              rounded-md 
              text-sm 
              focus:ring-2 
              focus:ring-customPink
              dark:focus:ring-lightGray
              "
              onChange={handleInputChange}
              >
               <option value="" disabled hidden>Select an option</option>
                <option value="short-term">Short-term relationship</option>
                <option value="long-term">Long-term relationship</option>
                <option value="friends">Find new friends</option>
                <option value="figuring-out">Still figuring out</option>
              </select>
          </div>

          <button className="mt-4 w-full p-3 text-white bg-customPink rounded-md hover:bg-red-600 dark:bg-nightBlack dark:hover:bg-gray-500 transition-all text-base"
          type='submit'
          >
            Continue
          </button>
        </form>
      
         <p className="mt-3 text-center text-sm text-gray-500 dark:text-gray-400">
           Already have an account? 
          <Link href="/user/login" className="text-customPink font-semibold dark:text-lightGray"> Log in</Link> 
         </p>
    </div>

    {/* Right side profile photo uploader */}
      <div className="mt-4 lg:mt-0 lg:ml-3 lg:w-1/3 flex items-center justify-center lg:justify-start flex-col space-y-3 p-3 bg-white rounded-lg dark:bg-darkGray">
        <h2 className="font-medium text-gray-700 text-base dark:text-lightGray">Profile photos</h2>
        {errors.images && <span className='text-red-500'>{errors.images.message}</span>}
        
        <div className="flex flex-col items-center justify-center">
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
      {imagePreviews.map((preview, index) => (
        <div
          key={index}
          className="relative"
          onDoubleClick={() => handleImageClick(index)}
        >
          <img
            src={preview}
            alt={`Preview ${index}`}
            className="w-16 h-16 object-cover rounded-md"
          />
          <button
            className="absolute top-0 right-0 bg-customPink text-white text-center rounded-full h-5 w-5 hover:bg-red-600 flex items-center justify-center"
            onClick={() => handleImageRemove(index)}
          >
            <span>x</span>
          </button>
        </div>
      ))}
      <label
        htmlFor="file-upload"
        className="w-16 h-16 bg-gray-300 rounded-md flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-400 transition-all"
      >
        <Plus />
      </label>
      <input
        id="file-upload"
        name="image"
        type="file"
        multiple
        className="hidden"
        onChange={handleImageUpload}
      />
    </div>

    <p className="text-xs text-gray-500 text-center dark:text-gray-400 mt-4">
      Upload 2 photos to start. Add 4 or more to make your profile stand out.
      <br />
      Double click to resize your image.
    </p>

    {/* Center the Take a Photo button */}
    <div className="mt-4 flex justify-center w-full">
      <button
        onClick={toggleModal}
        className="bg-customPink text-white px-4 py-2 rounded-lg hover:bg-red-500"
      >
        Take a photo
      </button>
    </div>
  </div>
     </div>

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

    {/* capture */}
    {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-darkGray w-full max-w-2xl rounded-lg shadow-lg p-6 relative">
            <button
              onClick={toggleModal}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
            >
              ×
            </button>

            <h2 className="text-xl font-bold text-center mb-4">Webcam Capture</h2>

            <WebcamCapture
              capturedImages={capturedImages}
              setCapturedImages={setCapturedImages}
            />
          </div>
        </div>
      )}
 
  </div>
  )
}

export default SetupForm