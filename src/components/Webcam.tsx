import React, { useCallback, useRef } from "react";
import Webcam from "react-webcam";

interface CapturedImage {
  id: string;
  file: File;
  previewUrl: string;
}

interface WebcamCaptureProps {
  capturedImages: CapturedImage[];
  setCapturedImages: React.Dispatch<React.SetStateAction<CapturedImage[]>>;
}

const WebcamCapture: React.FC<WebcamCaptureProps> = ({ capturedImages, setCapturedImages }) => {
  const webcamRef = useRef<Webcam | null>(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const captureImage = useCallback(() => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const filename = `image_${Date.now()}.jpeg`;
      const imageFile = dataURLtoFile(imageSrc, filename);

      const newImage: CapturedImage = {
        id: Date.now().toString(),
        file: imageFile,
        previewUrl: imageSrc,
      };

      setCapturedImages((prev: CapturedImage[]) => [...prev, newImage]);

      console.log("Captured Image File:", imageFile);
      console.log("Preview URL:", imageSrc);
    }
  }, [setCapturedImages]);

  const deleteImage = (imageId: string) => {
    setCapturedImages((prev: CapturedImage[]) => prev.filter((img) => img.id !== imageId));
  };

  return (
    <div className="p-4">
      <div className="relative">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="rounded-lg shadow-lg"
        />

        <div className="mt-4">
          <button
            onClick={captureImage}
            className="bg-customPink text-white px-4 py-2 rounded hover:bg-red-500"
          >
            Capture Photo
          </button>
        </div>
      </div>

      {capturedImages.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Captured Images</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {capturedImages.map((image) => (
              <div key={image.id} className="relative">
                <img
                  src={image.previewUrl}
                  alt="Captured"
                  className="rounded-lg shadow-md"
                />
                <div className="mt-2 text-sm text-gray-600">
                  <p>Size: {(image.file.size / 1024).toFixed(2)} KB</p>
                  <p>Type: {image.file.type}</p>
                </div>
                <button
                  onClick={() => deleteImage(image.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
