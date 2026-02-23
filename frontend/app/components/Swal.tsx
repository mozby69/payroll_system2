import Swal from "sweetalert2";

const SweetAlert = {


  
  loadingAlert: (title: string = "Loading...", text: string = "") => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  },



    
  successAlert: (title: string = "Success", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    });
  },

  successAlertFunction: (title: string = "Success", text: string = "",  runFuction: () => void,  onCLose: () => void ) => {
    return Swal.fire({
      title,
      text,
      icon: "success",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    }).then((result) => {
        if (result.isConfirmed && typeof runFuction === "function" || result.isDismissed) {
            runFuction();
            onCLose();
        }
      });
  },

  warningAlert: (title: string = "Warning", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
    });
  },

  errorAlert: (title: string = "Error", text: string = "") => {
    return Swal.fire({
      title,
      text,
      icon: "error",
      confirmButtonText: "Confirm",
      confirmButtonColor: "#6CCC84",
    });
  },



  confirmationAlert: (
    title: string = "Are you sure?",
    text: string = "",
    onConfirm?: () => void,
    onCancel?: () => void
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm();
      }

      if (result.isDismissed && typeof onCancel === "function") {
        onCancel();
      }
    });
  },

    remarksConfirmationAlert: (
    title: string = "Are you sure?",
    text: string = "",
    placeholder: string = "Enter remarks",
    onConfirm: (remarks: string) => void
  ) => {
    return Swal.fire({
      title,
      text,
      icon: "warning",
      input: "textarea",
      inputPlaceholder: placeholder,
      inputAttributes: {
        rows: "4",
      },
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#6CCC84",
      cancelButtonColor: "#464646",
      preConfirm: (value) => {
        if (!value || !value.trim()) {
          Swal.showValidationMessage("Remarks are required");
          return false;
        }
        return value;
      },
    }).then((result) => {
      if (result.isConfirmed && typeof onConfirm === "function") {
        onConfirm(result.value);
      }
    });
  },
};







export default SweetAlert;