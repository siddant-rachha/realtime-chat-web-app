import { toast } from "react-toastify";

export const useToast = () => {
  const successToast = (message: string) => {
    toast.success(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const errorToast = (message: string) => {
    toast.error(message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return {
    successToast,
    errorToast,
  };
};
