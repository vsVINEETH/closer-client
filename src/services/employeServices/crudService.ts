import useAxios from "@/hooks/axiosHooks/useAxios";
import { CategoryCreateData, SearchFilterSortParams } from "@/types/customTypes";
export const useCrudService = () => {
    const {handleRequest} = useAxios();

    const postContent = async (contentData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url: '/api/employee/create_content',
            method:'POST',
            data: contentData,
            headers:{
                'Content-Type': 'multipart/form-data', 
            },
            params: searchFilterSortParams 
        })
    };

    const listContent = async (contentId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/list_content',
            method:'POST',
            data:{
                id: contentId
            },
            params: searchFilterSortParams 
        })
    };

    const deleteContent = async (contentId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/delete_content',
            method:'DELETE',
            data:{
                id:contentId
            },
            params: searchFilterSortParams 
        })
    };

    const updateContent = async (updatedContentData: any | object, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/update_content',
            method:'PATCH',
            data: updatedContentData,
            params: searchFilterSortParams 
        })
    };


    const postCategory = async (categoryData: CategoryCreateData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/create_category',
            method:'POST',
            data: categoryData,
            params: searchFilterSortParams 
        })
    };

    const listCategory = async (categoryId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/list_category',
            method:'POST',
            data:{
                id: categoryId
            },
            params: searchFilterSortParams 
        })
    };

    const updateCategory = async (updatedCategoryData: any | object, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/update_category',
            method:'PUT',
            data: updatedCategoryData,
            params: searchFilterSortParams 
        })
    }

    return {postContent, listContent, deleteContent, updateContent,
            postCategory, listCategory, updateCategory,
        }
}