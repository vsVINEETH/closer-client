const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    return (
      <div className="relative group inline-block">
        {children}
        <div
          className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                     w-max bg-gray-800 text-white text-sm py-1 px-2 rounded-md 
                     opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          {text}
        </div>
      </div>
    );
  };
  
  export default Tooltip;
  