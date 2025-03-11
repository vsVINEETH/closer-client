import React from 'react';
import { ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
// Define types for column configuration
export interface Column<T> {
  key: string;
  label: string;
  sortable: boolean;
  render?: (item: T) => React.ReactNode;
}

const banOptions = [
  { value: 1, label: "1 Day" },
  { value: 7, label: "1 Week" },
  { value: 30, label: "1 Month" },
  // { value: "custom", label: "Custom" },
];

// Props interface with generic type parameter
export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onDelete?: (item: string) => void;
  onEdit?: (item: T) => void;
  onListed?: (itemId: string, index: number) => void;
  onBlocked?: (itemId: string, index: number) => void;
  onSort?: (header: keyof T) => void;
  pageSize?:number| undefined;
  totalPage?: number | undefined;
  currentPage?: number | undefined;
  handleNext?: () => void;
  handlePrevious?: () => void;
  handleBanUser?: (userId: string, duration: string, index: number) => void;
  handleUnban?: (userId: string, index: number) => void;
  isListed?: boolean;
  actionColumn?: boolean;
  customActionButtons?: (item: T) => React.ReactNode;
}

// Generic DataTable component
const DataTable = <T extends Record<string, any>>({
  data = [],
  columns = [],
  onDelete,
  onEdit,
  onListed,
  onBlocked,
  onSort,
  pageSize,
  totalPage,
  currentPage,
  handleNext,
  handlePrevious,
  handleBanUser,
  handleUnban,
  actionColumn = true,
  customActionButtons,
}: DataTableProps<T>) => {
  // Define the action column separately
  const actionColumnDef: Column<T> = {
    key: 'actions',
    label: 'Action',
    sortable:false,
    render: (item: T) => (
      <div className="flex items-center justify-center gap-3">
        {customActionButtons ? (
          customActionButtons(item)
        ) : (
          <>
            {onEdit && (
              <button
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                onClick={() => onEdit(item)}
            >
                <Pencil size={18} />
            </button>
            )}
            {onDelete && (
              <button
                className="p-2 text-xs font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => onDelete(item.id || item._id)}
              >
                <Trash2 size={18}/>
              </button>
            )}
            {onListed && (
              <button
                className={`px-4 py-1.5 text-xs justify-center items-center font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 ${
                  !item.isListed || item.isBlocked
                    ? 'bg-green-500/20 text-green-600 dark:bg-green-400/20 dark:text-green-300'
                    : 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-300'
                }`}
                onClick={() => {
                  const id = (item as any).id || '';
                  const index = data.indexOf(item);
                  onListed(id, index);
                }}
              >
                {item.isListed  ? 'Unlist' : 'List' }
              </button>
            )}

            {onBlocked && (
                <button
                className={`px-4 py-1.5 text-xs justify-center items-center font-semibold uppercase border rounded-lg transition-all dark:border-gray-500 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 ${
                   item.isBlocked
                    ? 'bg-green-500/20 text-green-600 dark:bg-green-400/20 dark:text-green-300'
                    : 'bg-red-500/20 text-red-600 dark:bg-red-400/20 dark:text-red-300'
                }`}
                onClick={() => {
                  const id = (item as any).id || '';
                  const index = data.indexOf(item);
                  onBlocked(id, index);
                }}
              >
                {item.isBlocked  ? 'Unblock' : 'Block' }
              </button>
            )}

          </>
        )}
      </div>
    ),
  };

  // Create final columns array with action column if needed
  const finalColumns: Column<T>[] = actionColumn
    ? [...columns, actionColumnDef]
    : columns;

  return (
    <>
      <div className="p-6 overflow-x-auto max-w-full">
        <table className="w-full text-center border-collapse min-w-max rounded-lg shadow-md overflow-hidden table-auto">
          <thead className="text-center bg-gray-100 dark:bg-darkGray">
          <tr className="text-gray-700 dark:text-gray-300 text-sm ">
            {finalColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="p-4 border-b border-gray-300 dark:border-gray-700  cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center justify-center gap-1">
                  {column.label}
                  {column.sortable && <ChevronsUpDown size={12} />}
                </div>
              </th>
            ))}
          </tr>
          </thead>
          <tbody className="text-gray-800 dark:text-gray-200 text-sm">
            {data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-100 dark:hover:bg-darkGray transition-all">
                  {finalColumns.map((column) => (
                    <td key={column.key} className="p-4 border-b justify-center justify-items-center items-center border-gray-300 dark:border-gray-700 whitespace-nowrap">
                      {column.render ? (
                        column.render(item)
                      ) : column.key === 'id' || column.key === '_id' ? (
                        item?.id?.slice(7, 16) || item?._id?.slice(7, 16)
                      ) : column.key === 'image' || column.key === 'images' ? (
                        item.image ? <img src={item.image} className="w-12 h-12 object-cover rounded-md" alt="Item" /> : "No Image"
                      ) : column.key === 'reportedUsers' ? (
                        item?.reportedUsers?.length ?? 0
                      ) : column.key === 'isBanned' ? (
                        !item.isBanned ? (
                          <select
                            onChange={(e) => handleBanUser?.(item.id, e.target.value, index)}
                            className="text-xs p-1 border border-gray-300 rounded-md dark:border-gray-300 dark:text-darkGray bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                          >
                            <option value="">Ban Duration</option>
                            {banOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-md shadow-sm w-28">
                            <button
                              className="text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition"
                              onClick={() => handleUnban?.(item.id, index)}
                            >
                              Unban
                            </button>
                            <p className="text-xs font-medium text-gray-700 dark:text-lightGray">
                              {item.banExpiresAt
                                ? Math.ceil((new Date(item.banExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + " days left"
                                : "Unknown"}
                            </p>
                          </div>
                        )
                      ) : column.key === 'eventDate' ? (
                        item.eventDate
                          ? new Date(item.eventDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                            ? 'Expired'
                            : new Date(item.eventDate).toLocaleDateString()
                          : "No Date"
                      ) : column.key === 'createdAt' ? (
                        new Date(item.createdAt).toLocaleDateString()
                      ):(item[column.key as keyof T] )}
                    </td>

                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={finalColumns.length}
                  className="p-4 text-center text-gray-500 dark:text-gray-300"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      <div className="flex items-center justify-between p-4  border-blue-gray-50">
      <p className="text-sm">
          Page {currentPage ?? 1} of {Math.ceil((totalPage ?? 1) / (pageSize ?? 1))}
      </p>
      <div className="flex gap-2">
          <button 
              onClick={handlePrevious} 
              disabled={currentPage === 1}
              className="select-none rounded-lg border dark:border-gray-50 dark:text-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              >
              Previous
          </button>
          <button
              onClick={handleNext}
              disabled={(currentPage ?? 1) >= Math.ceil((totalPage ?? 1) / (pageSize ?? 1))}
              className="select-none rounded-lg border dark:border-gray-50 dark:text-gray-50 border-gray-900 py-2 px-4 text-center align-middle font-sans text-xs font-bold uppercase text-gray-900 transition-all hover:opacity-75 focus:ring focus:ring-gray-300 active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
              >  
              Next
          </button>
      </div>
      </div>
   </> 
  );
};

export default DataTable;
