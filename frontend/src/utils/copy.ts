import { toast } from "react-toastify";

export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(
    () => {
      toast.success("Copied to clipboard!");
    },
    (err) => {
      console.error("Could not copy text: ", err);
    }
  );
};
