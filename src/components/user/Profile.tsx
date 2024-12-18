'use client'

import React, { useState, useEffect, use } from 'react'
import { Pencil } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/store'
import{ updateStatus } from "@/store/slices/userSlice";
import ReactCrop, { Crop,} from "react-image-crop";
import useAxios from '@/hooks/useAxios/useAxios'
import { errorToast, successToast } from '@/utils/toasts/toats'

interface Profile {
  username: string | undefined
  dob?: string | undefined
  email?: string | undefined
  phone: string | undefined
  lookingFor?: string | undefined
  interestedIn?: string | undefined
}
type ProfileImage = string[];
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newValue: string) => void
  fieldName: string
  currentValue: string | undefined
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSave, fieldName, currentValue }) => {
  const [value, setValue] = useState(currentValue || '' )

  useEffect(() => {
    if (isOpen) {
      // Reset the input value when the modal opens
      setValue(currentValue || '')
    }
  }, [isOpen, currentValue])

  const handleSubmit = () => {
    onSave(value)
    onClose()
  }

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      style={{ zIndex: 50 }}
    >
      <div className={`bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transition-all duration-300 ${isOpen ? 'transform scale-100' : 'transform scale-95'}`}>
        <h2 className="text-xl font-semibold mb-4">Edit {fieldName}</h2>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
        />
        <div className="flex justify-between">
          <button
            onClick={onClose}
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
  )
}

const Profile: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalField, setModalField] = useState<keyof Profile | null>(null);
  const [profileImage, setProfileImage] = useState<ProfileImage>([]);
  const [profile, setProfile] = useState<Profile>({
    username:'',
    phone:'',
    interestedIn: '',
    lookingFor: '',
  })
  const [images, setImages] = useState<File[]>([]);
  const [crop, setCrop] = useState<Crop | undefined>();

  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const dispatch = useDispatch()
  const {handleRequest} = useAxios()

  useEffect(() => {
    fetchData();
  },[])

  const fetchData = async () => {
    const response = await handleRequest({
      url:'/api/user/profile',
      method:'GET',
      data:{
        id: userInfo?.id
      },
      params:{
            id: userInfo?.id
        }
    });
    if(response.error){
      errorToast(response.error);
    }
    if(response.data){
      const data = {
        username: response.data.username,
        phone: response.data.phone,
        interestedIn: response.data.interestedIn,
        lookingFor: response.data.lookingFor,
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

    if (modalField && newValue.trim()) {
      const currentValue = profile[modalField];
      setProfile(prev => ({ ...prev, [modalField]: newValue }));

      try {
        const response = await handleRequest({
          url:'/api/user/update_profile',
          method:'PATCH',
          data:{
            field: modalField,
            value: newValue
          },
          params:{
            id: userInfo?.id
          }
        })

        if(response.error){
          errorToast(response.error)
          setProfile(prev => ({ ...prev, [modalField]: currentValue }));
        }

        if(response.data){
          const data = {
            username: response.data.username,
            phone: response.data.phone,
            interestedIn: response.data.interestedIn,
            lookingFor: response.data.lookingFor,
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
    const response = await handleRequest({
      url:'/api/user/profile_image',
      method:'DELETE',
      data:{
        id: userInfo?.id,
        src: src
      }
    });

    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      setProfileImage(response.data.image);
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files) 

    const preview = files.map((file) => URL.createObjectURL(file));
    setProfileImage(prev => [...prev, ...preview]);
    
  }

  const handleAddImage = async() => {
    const data = new FormData();
    images.forEach((image: File) => {
      data.append('images', image);
    });
    const response = await handleRequest({
      url:'/api/user/profile_image',
      method:'PATCH',
      data: data,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params:{
        id:userInfo?.id
      }
    });

    if(response.error){
      errorToast(response.error)
    }
    if(response.data){
      successToast('profile updated successfully')
      setProfileImage(response.data.image)
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setModalField(null)
  }

  return (
    // <div className="max-w-sm mx-auto bg-white dark:bg-darkGray rounded-lg shadow-md overflow-hidden">
      <div className="mx-auto bg-white dark:bg-darkGray rounded-lg shadow-md overflow-hidden min-h-[300px] min-w-[250px]">

      {/* Increased the size of the main image */}
      <div className="relative w-full h-48 bg-gray-100 dark:bg-darkGray overflow-hidden">
      {profileImage && profileImage[selectedImage] ? (
        <img
          src={profileImage[selectedImage]}
          alt="Profile picture"
          className="object-cover w-full h-full"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full text-gray-400">
          No Image
        </div>
      )}

      {/* Add Image Button */}
        <div className="absolute bottom-2 right-2">
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex items-center justify-center w-10 h-10 bg-customPink text-white rounded-full shadow hover:bg-red-500 transition"
            aria-label="Add Image"
          >
            +
          </label>
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleImageUpload(e)}
          />
        </div>
      </div>

      <div className="p-2 bg-gray-50 dark:bg-darkGray">
      <div className="flex gap-2 overflow-x-auto">
        {profileImage.length > 0 &&
          profileImage.map((src, index) => (
            <div key={index} className="relative flex-shrink-0 w-16 h-16 rounded-sm overflow-hidden border">
              <button
                onClick={() => setSelectedImage(index)}
                className={`absolute inset-0 ${
                  selectedImage === index ? 'border-customPink' : 'border-gray-300'
                }`}
              >
                <img
                  src={src}
                  alt={`Profile picture ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </button>
              {/* Delete Button */}
              <button
                onClick={() => handleDeleteImage(src)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                aria-label="Delete image"
              >
                &times;
              </button>
            </div>
          ))}
      </div>
    </div>


{/* profile card */}
      <div className="p-4 space-y-3">
        <div className="space-y-3">
          {Object.entries(profile).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-gray-500 dark:text-lightGray capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-sm font-medium dark:text-white">{value}</p>
              </div>
              <button
                onClick={() => handleEdit(key as keyof Profile)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit {key}</span>
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
        <button className="dark:text-white px-4 py-2 bg-customPink hover:bg-red-600 text-white dark:bg-nightBlack rounded-md transition-colors"
        onClick={handleAddImage}
        >
          update
        </button>
      </div>
      </div>

      {/* Modal to Edit Profile Fields */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        fieldName={modalField ? modalField.replace(/([A-Z])/g, ' $1').trim() : ''}
        currentValue={modalField ? profile[modalField] : ''}
      />
    </div>
  )
}

export default Profile
