import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import DownloadPDF from './PDF';
import DownloadCSV from './CSV';
import DownloadXLXS from './XLXS';
import { Report } from '@/types/customTypes';
import Tooltip from '../reusables/ToolTip';
interface ReportsProps {
    salesData: Report['salesData']; //  `salesData` instead of full `Report`
  }
  
const Reports: React.FC <ReportsProps>= ({salesData}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
  <Tooltip text='Download sales report'>
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-customPink dark:bg-gray-400  text-white px-4 py-1 rounded-lg shadow-md hover:bg-red-600 transition-all"
      >
        Reports <ChevronDown size={18} />
      </button>

      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden border"
        >
          <ul>
            <li className="hover:bg-gray-100 cursor-pointer p-2 text-gray-700 border-b"><DownloadPDF salesData={salesData}/></li>
            <li className="hover:bg-gray-100 cursor-pointer p-2 text-gray-700 border-b"><DownloadCSV salesData={salesData}/></li>
            <li className="hover:bg-gray-100 cursor-pointer p-2 text-gray-700"><DownloadXLXS salesData={salesData}/></li>
          </ul>
        </motion.div>
      )}
    </div>
    </Tooltip>
  );
};

export default Reports;