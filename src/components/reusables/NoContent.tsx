import { motion } from "framer-motion";
import { FaBoxOpen } from "react-icons/fa";

const NoContent = ({ message = "No content available" }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center p-6 mt-10 border border-gray-300 rounded-2xl shadow-sm bg-white dark:bg-nightBlack"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <FaBoxOpen className="text-gray-400 text-6xl mb-4" />
      </motion.div>
      <p className="text-gray-600 dark:text-gray-300 text-lg font-semibold">
        {message}
      </p>
    </motion.div>
  );
};

export default NoContent;
