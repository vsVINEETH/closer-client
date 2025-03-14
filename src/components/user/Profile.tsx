'use client'

import React, { useState, useEffect} from 'react'
import {  Cake, Pencil, Heart, Phone } from "lucide-react"
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { successToast } from '@/utils/toasts/toast'
import { deleteConfirm, editConfirm } from '@/utils/sweet_alert/sweetAlert'
import { useFetch } from '@/hooks/fetchHooks/useUserFetch';
import useAxios from '@/hooks/axiosHooks/useAxios'
import { motion} from "framer-motion";

interface Profile {
  username: string | undefined
  dob?: string | undefined
  email?: string | undefined
  phone: string | undefined
  lookingFor?: string | undefined
  interestedIn?: string | undefined
}

interface Errors {
  username?: string
  dob?: string 
  email?: string
  phone?: string
  lookingFor?: string
  interestedIn?: string
}

type ProfileImage = string[];

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newValue: string) => void
  fieldName: string
  currentValue: string | undefined
}

const optionsMap: Record<string, { label: string; value: string }[]> = {
  "interested In": [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Others", value: "others" }
  ],
  "looking For": [
    { label: "Short-term relationship", value: "short-term" },
    { label: "Long-term relationship", value: "long-term" },
    { label: "Find new friends", value: "friends" },
    { label: "Still figuring out", value: "figuring-out" }
  ]
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, fieldName, currentValue }) => {
  const [value, setValue] = useState(currentValue || "");
  const [error, setError] = useState<Errors>({});

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue || "");
    }
  }, [isOpen, currentValue]);

  const handleSubmit = async() => {
    
    const result = await editFormValidation()
    if(result){
      onSave(value);
      onClose();
      setError({});
    };
  };

  const handleClose = () => {
    onClose();
    setError({})
  }

  const editFormValidation = async () => {
    const newError: Errors = {};
    const birthDate = new Date(value);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    const phoneNumberRegex = /^(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
  
    if (age < 18) {
      newError.dob = 'Your age should be 18 or above';
    }
  
    if (
      fieldName === 'phone' &&
      (value.length < 10 || value.length > 15 || !phoneNumberRegex.test(value))
    ) {
      newError.phone = 'Please enter a valid phone number';
    }
  
    // Update state only after final validation check
    setError(newError);
  
    return Object.keys(newError).length === 0;
  };
  

  const options = optionsMap[fieldName]; // Check if the field has predefined options

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      style={{ zIndex: 50 }}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 ${
          isOpen ? "transform scale-100" : "transform scale-95"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Edit {fieldName.replace(/([A-Z])/g, " $1").trim()}</h2>

        {options ? (
          // Render a select dropdown if predefined options exist
          <select
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md mb-4 dark:bg-gray-800 dark:text-gray-300"
          >
            <option value="" disabled hidden>Select an option</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          // Render an input field if no predefined options
          <>
        <input
          type={fieldName === 'dob' ? 'date' : 'text'}
          value={fieldName === 'dob' 
            ? value ? new Date(value).toLocaleDateString('en-CA') : '' 
            : value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 dark:bg-gray-800 dark:text-gray-300"
        />
        <span className='font-thin text-red-700'>{error && error[fieldName as keyof Errors]}</span>
        </>
        )}

        <div className="flex justify-between">
          <button
            onClick={handleClose}
            className="py-2 px-4 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-4 bg-customPink text-white rounded-md hover:bg-red-500 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};


const Profile: React.FC = () => {
  const [selectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalField, setModalField] = useState<keyof Profile | null>(null);
  const [profileImage, setProfileImage] = useState<ProfileImage>([]);
  const [profile, setProfile] = useState<Profile>({
    username:'',
    phone:'',
    interestedIn: '',
    lookingFor: '',
    dob:'',
  })
  const [images, setImages] = useState<File[]>([]);

  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const {handleRequest} = useAxios();
  const {getProfileDetails, editProfile, deleteProfilePicture, updateProfilePicture} = useFetch()

  useEffect(() => {
    fetchData();
  },[]);


  useEffect(() => {
    if(images.length){
      handleAddImage();
    }
  },[images]);

  const fetchData = async () => {
    if(!userInfo?.id) return;
    const response = await getProfileDetails(userInfo?.id);

    if(response.data){
      const data = {
        username: response.data.username,
        phone: response.data.phone,
        interestedIn: response.data.interestedIn,
        lookingFor: response.data.lookingFor,
        dob: response.data.dob
      }
      setProfile(data)
      setProfileImage(response.data.image)
    }
  }

  const handleEdit = (field: keyof Profile) => {
    setModalField(field)
    setIsModalOpen(true)
  }



  const handleSave = async (newValue: string) => {
    
    const confirm = await editConfirm();
    if(!confirm){return}

    if (modalField && newValue.trim()) {

      const currentValue = profile[modalField];

      setProfile(prev => ({ ...prev, [modalField]: newValue }));

      try {
        if(!userInfo?.id) return;
        const response = await editProfile(userInfo?.id, modalField, newValue)

        if(response.error){
          setProfile(prev => ({ ...prev, [modalField]: currentValue }));
        }

        if(response.data){
          const data = {
            username: response.data.username,
            phone: response.data.phone,
            interestedIn: response.data.interestedIn,
            lookingFor: response.data.lookingFor,
            dob: response.data.dob
          }
          setProfile(data)
          setProfileImage(response.data.image)
          successToast('Profile updated')
        }

      } catch (error) {
        console.error('Error updating profile:', error);
        setProfile(prev => ({ ...prev, [modalField]: currentValue }));
      }
    }
  };
  

  const handleDeleteImage = async(src: string) => {
    if(!userInfo?.id) return;
    const confirm = await deleteConfirm();
    if(!confirm) return;
    const response = await deleteProfilePicture(userInfo?.id, src)
    if(response.data){
      setProfileImage(response.data.image);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files) 

    const preview = files.map((file) => URL.createObjectURL(file));
    setProfileImage(prev => [...prev, ...preview]);
    
  };

  const handleAddImage = async() => {
    const data = new FormData();
    images.forEach((image: File) => {
      data.append('images', image);
    });
    const confirm = await editConfirm();
    if(!confirm){return};
    if(!userInfo?.id) return;
    const response = await updateProfilePicture(userInfo?.id, data)
    if(response.error){
      images.length -= 1
    }
    if(response.data){
      successToast('profile updated successfully')   
      setProfileImage(response.data.image);
    }
  };

  const handleSwapImage  = (imageIndex: number) => {
    setProfileImage((prev) => {
      if (!prev || prev.length < 2) return prev; // Ensure at least two elements exist
    
      const lastIndex = prev.length - 1;
      if (imageIndex < 0 || imageIndex >= lastIndex) return prev; // Validate index
    
      // Create a shallow copy of the array
      const newImages = [...prev];
    
      // Swap values
      [newImages[imageIndex], newImages[lastIndex]] = [newImages[lastIndex], newImages[imageIndex]];
    
      return newImages;
    });
  }

  const changeProfilePicture = async (imageIndex: number) => {
    
    if(!userInfo?.id) return;
    
    const response = await handleRequest({
      url:'/api/user/change_profile_image',
      method:'PATCH',
      data:{
        imageIndex,
        userId: userInfo?.id
      }
    });

    if(response.data){
      handleSwapImage(imageIndex);
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setModalField(null)
  }

  return (
   <>
      {/* Back Button */}
      {/* <div className="flex items-center dark:text-white text-gray-500 cursor-pointer" onClick={goBack}>
        <ChevronLeft size={20} />
        <span> Back</span>
      </div> */}

      {/* Profile Card */}

    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto bg-white dark:bg-darkGray rounded-lg shadow-lg overflow-hidden w-full max-w-10xl"
    >
      {/* Cover Photo */}
      <motion.div
        className="relative w-full h-48 bg-gray-200 dark:bg-gray-700"
        whileHover={{ scale: 1.02 }}
      >
        <img
          src={profileImage[0] || ""}
          alt="Cover photo"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Profile Info Section */}
      <div className="flex flex-col items-center p-4 -mt-12">
        {/* Profile Picture */}
        <motion.div
          className="relative w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white dark:border-darkGray shadow-lg"
          whileHover={{ scale: 1.05 }}
        >
          {profileImage[selectedImage] ? (
            <img
              src={profileImage[profileImage.length - 1]}
              alt="Profile picture"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No Image
            </div>
          )}
          <motion.div
            className="absolute bottom-0 inset-x-0 bg-black bg-opacity-50 text-white text-center py-1 text-xs"
            whileHover={{ opacity: 0.8 }}
          >
            <label htmlFor="file-upload" className="cursor-pointer">
              Change
            </label>
            <input
              type="file"
              id="file-upload"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </motion.div>
        </motion.div>

        {/* Name and Additional Info */}
        <h2 className="text-xl font-semibold dark:text-white mt-3">
          {profile.username || "User Name"}
        </h2>
        <p className="text-gray-500 dark:text-lightGray">
          {`Interested in ${profile.interestedIn}'s`}
        </p>

        <div className="flex space-x-4 mt-3 text-gray-600 dark:text-gray-400 text-sm">
          <div className="flex items-center">
            <Heart size={16} className="mr-1" />
            <span>{profile?.lookingFor || "Nothing"}</span>
          </div>
          <div className="flex items-center">
            <Phone size={16} className="mr-1" />
            <span>{profile.phone || "000000000"}</span>
          </div>
          <div className="flex items-center">
            <Cake size={16} className="mr-1" />
            <span>{profile.dob || "0000-00-00"}</span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="mt-4 p-4 space-y-3">
        {Object.entries(profile).map(([key, value]) => (
          <motion.div
            key={key}
            className="flex items-center justify-between text-sm p-2 bg-gray-100 dark:bg-nightBlack rounded-lg"
            whileHover={{ scale: 1.02 }}
          >
            <div>
              <p className="text-gray-500 dark:text-lightGray capitalize">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </p>
              <p className="font-medium dark:text-white">{value || "Not specified"}</p>
            </div>
            <button
              onClick={() => handleEdit(key as keyof typeof profile)}
              className="p-2 text-blue-500 hover:text-blue-600"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit {key}</span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Image Gallery */}
      <div className="mt-4 p-4 overflow-hidden">
        <h2 className="text-xl  font-semibold dark:text-white mb-3">Your Gallery </h2>
        
        <motion.div 
          className="grid grid-cols-4 gap-3" // Change to grid layout
        >
          {profileImage.map((src, index) => (
            <motion.div
              key={index}
              className="relative w-24 h-24 md:w-32 md:h-32 rounded-lg overflow-hidden shadow-lg"
              whileHover={{ scale: 1.1 }}
            >
              <motion.img
                src={src || "/placeholder.svg"}
                alt={`Profile picture ${index + 1}`}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => changeProfilePicture(index)}
                whileTap={{ scale: 0.95 }}
              />
              <motion.button
                onClick={() => handleDeleteImage(src)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                whileHover={{ scale: 1.3, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                &times;
              </motion.button>
            </motion.div>
          ))}
        </motion.div>
    </div>

    </motion.div>

    {/* Modal to Edit Profile Fields */}
      <Modal
       isOpen={isModalOpen}
       onClose={handleModalClose}
       onSave={handleSave}
       fieldName={modalField ? modalField.replace(/([A-Z])/g, ' $1').trim() : ''}
       currentValue={modalField ? profile[modalField] : ''}
     />

    </>
  )
}

export default Profile



