import { toast, Slide } from "react-toastify";

export const errorToast = (error: string | unknown ) => {
    toast.error(String(error), {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "small-toast",
      transition: Slide,
      style: { fontSize: "12px", padding: "8px 12px", minHeight: "30px" },
    });
  };

  export const successToast = (success: string | unknown ) => {
    toast.success(String(success), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "small-toast",
        transition: Slide,
        style: { fontSize: "12px", padding: "8px 12px", minHeight: "30px" },
      });
  }

  export const warnToast = (warn: string | unknown ) => {
    toast.warn(String(warn), {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "small-toast",
        transition: Slide,
        style: { fontSize: "12px", padding: "8px 12px", minHeight: "30px" },
      });
  }


  export const infoToast = (info: string | unknown ) => {
    toast.info(String(info), {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "small-toast",
        transition: Slide,
        style: { fontSize: "12px", padding: "8px 12px", minHeight: "30px" },
      });
  }

