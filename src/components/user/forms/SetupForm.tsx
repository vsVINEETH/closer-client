'use client'
import React, {useState, useEffect, useRef} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactCrop, { Crop,} from "react-image-crop";
import { login } from '@/store/slices/userSlice';
import { useDispatch } from 'react-redux';
import useAxios from '@/hooks/useAxios/useAxios';
import { errorToast, successToast, warnToast } from '@/utils/toasts/toats';
import { Plus } from 'lucide-react';
import WebcamCapture from "@/components/Webcam";

interface FormData {
  dob: string;
  gender: string;
  interest: string;
  lookingFor: string;
}

interface Errors {
  dob?: string;
  gender?: string;
  interest?: string;
  lookingFor?: string;
  images?: string;
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
interface CapturedImage {
  id: string;
  file: File;
  previewUrl: string;
}


const SetupForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ dob: '', gender: '', interest: '', lookingFor:''});
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Errors>({});

  const [crop, setCrop] = useState<Crop | undefined>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);

  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const {handleRequest} = useAxios()
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() =>{
    const newFiles = capturedImages.map((img) => img.file);
    const newPreviews = capturedImages.map((img) => img.previewUrl);

    setImages((prevImages) => [...prevImages, ...newFiles]);
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  },[capturedImages])


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData((perv) => ({
      ...perv,
      [name]: value
    }))

    setErrors({})
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files) 

    const preview = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(preview);
  }

  const handleImageRemove = (index: number) => {
    if(imagePreviews.length === 0){
      setCurrentImageIndex(null);
    } 

    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if(validation()){
      const email = localStorage.getItem('email');
      const data = new FormData();
    
      data.append('email', email || ''); 
      data.append('dob', formData.dob);
      data.append('gender', formData.gender);
      data.append('interestedIn', formData.interest);
      data.append('lookingFor', formData.lookingFor);
      images.forEach((image: File) => {
        data.append('images', image);
      });

      const response = await handleRequest({
        url:'/api/user/setup',
        method:'POST',
        data: data,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      })

      if(response.error){
        errorToast(response.error)
      }
     
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

  }

  const validation = (): boolean => {
    
    const newErrors: Errors = {};
    const dob: string = formData.dob;
    const currentYear: number = new Date().getFullYear();
    const dobDateYear: number = new Date(dob).getFullYear();

    if(!formData.dob.trim()){
      newErrors.dob = "This field is required";
    } else if ((currentYear - dobDateYear) < 18){
      warnToast('Entry restricted you are under 18')
      newErrors.dob = ''
    }

    if (!formData.gender) {
      newErrors.gender = "This field is required";
    }

    if (!formData.interest) {
      newErrors.interest = "This field is required";
    }

    if (!formData.lookingFor) {
      newErrors.lookingFor = "This field is required";
    }

    if(images.length < 2){
      newErrors.images = 'minimum 2 images are required'
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  return (
    <div className="max-w-4xl bg-white dark:bg-darkGray dark:border-darkGray border shadow-md sm:rounded-lg flex flex-col lg:flex-row p-4 lg:p-8 w-full">
    <div className="lg:w-2/3 space-y-4">
      <h1 className="text-center text-2xl font-extrabold text-customPink dark:text-lightGray">Set up Account</h1>
      <form className="space-y-3"
      onSubmit={handleSubmit}
          >
          <div className="flex flex-col lg:flex-row space-x-0 lg:space-x-2 space-y-2 lg:space-y-0">
            <div className="flex-1 flex flex-col space-y-1">
              <label className="text-gray-500 text-sm dark:text-lightGray">Birthday {errors.dob && <span className='text-red-500'>{ errors.dob }</span>}</label>
                   
                <input 
                  type="date" 
                  id="date" 
                  name="dob" 
                  className="p-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-customPink dark:focus:ring-lightGray"
                  onChange={handleChange}
                />
            
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-500 text-sm dark:text-lightGray">Gender{errors.gender && <span className='text-red-500'> { errors.gender }</span>}</label>
            <div className="flex space-x-2 text-gray-500">
                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="gender" 
                  value="men" 
                  className="mr-2" 
                  onChange={handleChange}
                  />
                  Male
                </label>


                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  className="mr-2" 
                  onChange={handleChange}
                  />
                  Female
                </label>

                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="gender" 
                  value="other" 
                  className="mr-2" 
                  onChange={handleChange}
                  />
                  Other
                </label>

                
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-gray-500 text-sm dark:text-lightGray">Interested in {errors.interest && <span className='text-red-500'>{ errors.interest }</span>}</label>
            <div className="flex space-x-2 text-gray-500">
                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="interest" 
                  value="men" 
                  className="mr-2"
                  onChange={handleChange} 
                  />
                  Male
                </label>


                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="interest" 
                  value="female" 
                  className="mr-2"
                  onChange={handleChange} 
                  />
                  Female
                </label>

                <label className="flex items-center p-2 border border-gray-300 rounded-md min-w-44 dark:text-lightGray">
                  <input 
                  type="radio" 
                  name="interest" 
                  value="other" 
                  className="mr-2" 
                  onChange={handleChange}
                  />
                  Other
                </label>

            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <label htmlFor="lookingFor" className="text-gray-500 text-sm dark:text-lightGray">Looking for {errors.lookingFor && <span className='text-red-500'>{ errors.lookingFor }</span>}</label>
              <select 
              id="lookingFor"
              name='lookingFor'
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
              onChange={handleChange}
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
      {errors.images && <span className='text-red-500'>{errors.images}</span>}
      
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