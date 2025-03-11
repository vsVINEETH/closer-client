import useAxios from "@/hooks/axiosHooks/useAxios";
import { CategoryCreateData } from "@/types/customTypes";
export const useCrudService = () => {
    const {handleRequest} = useAxios();

    const postContent = async (contentData: FormData) => {
        return await handleRequest({
            url: '/api/employee/create_content',
            method:'POST',
            data: contentData,
            headers:{
                'Content-Type': 'multipart/form-data', 
            }
        })
    };

    const listContent = async (contentId: string) => {
        return await handleRequest({
            url:'/api/employee/list_content',
            method:'POST',
            data:{
                id: contentId
            }
        })
    };

    const deleteContent = async (contentId: string) => {
        return await handleRequest({
            url:'/api/employee/delete_content',
            method:'DELETE',
            data:{
                id:contentId
            }
        })
    };

    const updateContent = async (updatedContentData: any | object) => {
        return await handleRequest({
            url:'/api/employee/update_content',
            method:'PATCH',
            data: updatedContentData,
        })
    };


    const postCategory = async (categoryData: CategoryCreateData) => {
        return await handleRequest({
            url:'/api/employee/create_category',
            method:'POST',
            data: categoryData
        })
    };

    const listCategory = async (categoryId: string) => {
        return await handleRequest({
            url:'/api/employee/list_category',
            method:'POST',
            data:{
                id: categoryId
            }
        })
    };

    const updateCategory = async (updatedCategoryData: any | object) => {
        return await handleRequest({
            url:'/api/employee/update_category',
            method:'PUT',
            data: updatedCategoryData 
        })
    }

    return {postContent, listContent, deleteContent, updateContent,
            postCategory, listCategory, updateCategory,
        }
}