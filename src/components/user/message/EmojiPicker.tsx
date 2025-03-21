import { useState, useRef, useEffect } from "react";
import { SmilePlus } from "lucide-react";
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
      <SmilePlus size={25}  className="dark:text-white"
      onClick={() => setShowPicker((prev) => !prev)}
      />

    </div>
  );
};

export default FloatingEmojiPicker;
