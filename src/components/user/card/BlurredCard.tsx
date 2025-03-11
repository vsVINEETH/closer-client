import type React from "react"
import { UserDTO } from "@/types/customTypes";

const BlurredCard: React.FC<{ user: UserDTO; direction: "left" | "right" }> = ({ user, direction }) => {
  return (
    <div
      className={`absolute top-0 ${
        direction === "left" ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"
      } w-64 h-96 rounded-3xl overflow-hidden shadow-lg blur-sm opacity-50 transition-all duration-300 ease-in-out`}
    >
      <img
        src={
          user?.image && user?.image[0]
            ? user?.image[0]
            : "https://img.freepik.com/free-photo/background_53876-32170.jpg"
        }
        alt="Profile"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      <div className="absolute bottom-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{user?.username}</h3>
      </div>
    </div>
  )
}

export default BlurredCard;