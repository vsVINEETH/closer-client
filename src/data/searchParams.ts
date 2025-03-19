interface FilterOption {
    startDate: string,
    endDate: string,
    status: boolean | undefined,
}

export const searchFilterSortParamsMaker = async (searchValue: string, filterOption: FilterOption, column: string | undefined, direction: string | undefined, page: number, pageSize: number) => {

    return {
        search: searchValue || '',
        startDate:filterOption.startDate || '',
        endDate: filterOption.endDate || '',
        status: filterOption.status,
        sortColumn: column || 'createdAt',
        sortDirection: direction|| 'asc',
        page: page,
        pageSize: pageSize,
    }
}