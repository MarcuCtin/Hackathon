import { useState } from "react";
import { motion } from "motion/react";
import { User, Camera } from "lucide-react";

interface UserAvatarProps {
  size?: number;
  editable?: boolean;
  onImageChange?: (image: string) => void;
  imageUrl?: string;
  userName?: string;
}

export function UserAvatar({
  size = 80,
  editable = false,
  onImageChange,
  imageUrl,
  userName = "User",
}: UserAvatarProps) {
  const [isHovered, setIsHovered] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageChange) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div
      className="relative inline-block"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: editable ? 1.05 : 1 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="rounded-full overflow-hidden bg-gradient-to-br from-sky-400 via-cyan-400 to-emerald-400 p-1 shadow-xl"
        style={{ width: size, height: size }}
      >
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sky-100 to-emerald-100 flex items-center justify-center">
              <span
                className="bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent"
                style={{ fontSize: size * 0.35 }}
              >
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>

      {editable && (
        <>
          <input
            type="file"
            id="avatar-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <label
            htmlFor="avatar-upload"
            className="cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white" />
            </motion.div>
          </label>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400 flex items-center justify-center shadow-lg border-2 border-white"
          >
            <Camera className="w-4 h-4 text-white" />
          </motion.div>
        </>
      )}

      {!editable && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 border-2 border-white shadow-lg"
        />
      )}
    </motion.div>
  );
}
