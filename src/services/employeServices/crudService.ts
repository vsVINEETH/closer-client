import useAxios from "@/hooks/axiosHooks/useAxios";
import { CategoryCreateData, SearchFilterSortParams, ContentData, CategoryData } from "@/types/customTypes";
export const useCrudService = () => {
    const {handleRequest} = useAxios();

    const postContent = async (contentData: FormData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url: '/api/employee/contents',
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
            url:'/api/employee/contents/listing',
            method:'POST',
            data:{
                id: contentId
            },
            params: searchFilterSortParams 
        })
    };

    const deleteContent = async (contentId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/contents',
            method:'DELETE',
            data:{
                id:contentId
            },
            params: searchFilterSortParams 
        })
    };

    const updateContent = async (updatedContentData: ContentData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/contents',
            method:'PATCH',
            data: updatedContentData,
            params: searchFilterSortParams 
        })
    };


    const postCategory = async (categoryData: CategoryCreateData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/categories',
            method:'POST',
            data: categoryData,
            params: searchFilterSortParams 
        })
    };

    const listCategory = async (categoryId: string, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/categories/listing',
            method:'POST',
            data:{
                id: categoryId
            },
            params: searchFilterSortParams 
        })
    };

    const updateCategory = async (updatedCategoryData: CategoryData, searchFilterSortParams: SearchFilterSortParams) => {
        return await handleRequest({
            url:'/api/employee/categories',
            method:'PUT',
            data: updatedCategoryData,
            params: searchFilterSortParams 
        })
    }

    return {postContent, listContent, deleteContent, updateContent,
            postCategory, listCategory, updateCategory,
        }
}