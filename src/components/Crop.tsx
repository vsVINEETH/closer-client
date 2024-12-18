'use client';
import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropImageProps {
  imageUrl: string;
  aspect?: number; // Optional aspect ratio
  onCropComplete: (croppedFile: File, croppedImageUrl: string) => void;
  onCancel: () => void;
}

const CropImage: React.FC<CropImageProps> = ({
  imageUrl,
  aspect = 1 / 1, // Default to a square aspect ratio
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Crop>({ aspect });
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleCropComplete = (pixelCrop: PixelCrop) => {
    if (imageRef.current && pixelCrop.width && pixelCrop.height) {
      const canvas = document.createElement('canvas');
      const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
      const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(
          imageRef.current,
          pixelCrop.x * scaleX,
          pixelCrop.y * scaleY,
          pixelCrop.width * scaleX,
          pixelCrop.height * scaleY,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            const croppedImageUrl = URL.createObjectURL(blob);
            const croppedFile = new File([blob], 'cropped-image.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            onCropComplete(croppedFile, croppedImageUrl);
          }
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-md shadow-lg max-w-md">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => handleCropComplete(c)}
          aspect={aspect}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Crop preview"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </ReactCrop>
        <div className="flex justify-between mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropImage;
