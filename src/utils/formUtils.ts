// not using plan was utilising same input component everywhere
import { ChangeEvent } from "react";

export const handleFormChange = <T>(
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    setFormData: React.Dispatch<React.SetStateAction <T>>
) => {
    
    const {name, value} = e.target;

    setFormData((prev) => ({
        ...prev,
        [name]: value
    }))
}