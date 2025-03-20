import Swal from "sweetalert2";

export const logoutConfirm = async (): Promise <boolean> => {
    const result = await Swal.fire({
      title: "Are you sure you want to logout?",
      text: "You will need to log in again to access your account.",
      icon: "question",
      draggable: true,
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "No, cancel!",
      confirmButtonColor: "#202020",
      cancelButtonColor: "#ff0000",
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      }
    });

    if (result.isConfirmed) {
        await Swal.fire({
          title: "Logging out...",
          text: "Please wait while we log you out.",
          icon: "info",
          showConfirmButton: false,
          timer: 2000,
          didOpen: () => {
            Swal.showLoading();
          },
        });
     }
    return result.isConfirmed
 };

 export const deleteConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure you want to delete?",
    text: "This action cannot be undone.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};

export const editConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure you want to edit?",
    text: "Your changes will be saved.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Edit",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#007bff",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};

export const blockConfirm = async (isBlock: boolean): Promise<boolean> => {
  const result = await Swal.fire({
    title:isBlock? "Are you sure you want to block this user?": "Are you sure you want to unblock this user?",
    text: isBlock?"They will no longer be able use the application":"They will be able use the application",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: isBlock ? "Yes, block" : "Yes, Unblock",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#ff0000",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};


export const reportConfim = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title:"Are you sure you want to report this user?",
    text: 'If this report is false, it may negatively impact their profile.',
    icon: "warning",
    showCancelButton: true,
    confirmButtonText:  "Yes, report",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#ff0000",
    cancelButtonColor: "#6c757d",
  })

  return result.isConfirmed
}

export const banConfirm = async (isBanned: boolean, duration?: string,): Promise<boolean> => {
  const result = await Swal.fire({
    title:isBanned? "Are you sure you want to ban this user?": "Are you sure you want to unban this user?",
    text: isBanned ? `The user will be restricted from using the application for ${duration || 'this'} during the ban period.` : "The user will have full access to the application.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: isBanned ? "Yes, Ban" : "Yes, Unban",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#ff0000",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
}

export const createConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure you want to create this item?",
    text: "Make sure all details are correct.",
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Yes, Create",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};

export const listUnlistConfirm = async (isListing: boolean): Promise<boolean> => {
  const result = await Swal.fire({
    title: isListing ? "Are you sure you want to list this item?" : "Are you sure you want to unlist this item?",
    text: isListing ? "This item will be available for users." : "This item will no longer be available.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: isListing ? "Yes, List" : "Yes, Unlist",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: isListing ? "#28a745" : "#d33",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};

export const unmatchConfirm = async (username: string): Promise<boolean> => {
  const result = await Swal.fire({
    title: `Are you sure ?`,
    text:  `Do you want to unmatch ${username}`,
    icon: "info",
    showCancelButton: true,
    confirmButtonText: "Yes, Unmatch",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#28a745",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed
}


export const handlePaymentSuccess =  async (isWallet: boolean) => {
  const result = await Swal.fire({
    title: "Payment Successful! You have reserved your slots.",
    text: isWallet ? "Your wallet balance has been deducted.": "Amount debited from your bank account",
    icon: "success",
    confirmButtonText: "OK",
  });

  return result.isConfirmed
};


export const paymentConfirm = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure you want to initiate payment?",
    text: "This action cannot be undone",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Initiate",
    cancelButtonText: "No, Cancel",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#6c757d",
  });

  return result.isConfirmed;
};