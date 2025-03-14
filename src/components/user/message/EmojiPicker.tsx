import { useState, useRef, useEffect } from "react";
import EmojiPicker from "emoji-picker-react";

interface FloatingEmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const FloatingEmojiPicker: React.FC<FloatingEmojiPickerProps> = ({ onEmojiSelect}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // Handle clicking outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  return (
    <div className="relative">
      {/* Emoji Picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-12 right-2 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg transition-all duration-200"
        >
          <EmojiPicker
            onEmojiClick={(emojiObject) => {
              onEmojiSelect(emojiObject.emoji);
              //setShowPicker(false);
            }}
          />
        </div>
      )}

      {/* Emoji Button */}
      <button
        className="mt-2 bg-gray-100 dark:bg-darkGray p-2 rounded hover:bg-gray-200"
        onClick={() => setShowPicker((prev) => !prev)}
      >
        😀
      </button>
    </div>
  );
};

export default FloatingEmojiPicker;
