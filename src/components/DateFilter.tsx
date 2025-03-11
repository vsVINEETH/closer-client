import { useState, FC, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Minimize } from "lucide-react";

interface DateFilterProps {
  onFilter: (startDate: string, endDate: string) => void;
}

const DateFilter: FC<DateFilterProps> = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isApplied, setIsApplied] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const validateDates = () => {
    if (!startDate || !endDate) {
      setError("Both dates are required.");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date cannot be later than end date.");
      return false;
    }

    if(new Date(endDate) > new Date()){
      setError('End date cannot be future date');
      return false
    }
    setError(null);
    return true;
  };

  const handleApplyFilter = () => {
    if (validateDates()) {
      onFilter(startDate, endDate);
      setIsOpen(false);
      setIsApplied(true);
    }
  };

  const handleRemoveFilter = () => {
    setIsApplied(false);
    onFilter('','');
    setStartDate('');
    setEndDate('');
  }

  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={filterRef}>
      {/* Toggle Button */}
      <button
        className="bg-customPink dark:bg-lightGray text-white dark:text-gray-500  px-4 py-2 rounded-md transition hover:bg-red-600 dark:hover:bg-nightBlack "
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <Minimize size={15} /> : <SlidersHorizontal size={16} />}
      </button>

      {/* Animated Filter Section */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute right-0 mt-2 bg-white dark:bg-darkGray dark:text-gray-400 shadow-lg rounded-lg p-4 w-64"
        >
          <div className="flex flex-col gap-3">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300">From Date</label>
              <input
                type="date"
                className="border rounded p-2 text-sm"
                value={startDate}
                disabled={isApplied}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 dark:text-gray-300">To Date</label>
              <input
                type="date"
                className="border rounded p-2 text-sm"
                value={endDate}
                disabled={isApplied}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Validation Error Message */}
            {error && <p className="text-red-500 text-xs">{error}</p>}

           { !isApplied  ? 
          (   <button
              className="bg-customPink dark:hover:text-gray-50 dark:bg-lightGray text-white dark:text-gray-500 px-4 py-2 rounded-md transition hover:bg-red-600 dark:hover:bg-nightBlack"
              onClick={handleApplyFilter}
            >
              Apply
            </button>
            ):(
              <button
              className="bg-customPink dark:bg-lightGray text-white dark:text-gray-500 px-4 py-2 rounded-md transition hover:bg-red-600 dark:hover:bg-nightBlack"
              onClick={handleRemoveFilter}
            >
              Remove
            </button>
            )

            }


          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DateFilter;
