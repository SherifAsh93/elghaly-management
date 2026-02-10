import React from "react";
import { LOGO_URL } from "../../constants";

interface LogoProps {
  variant?: "light" | "dark";
  showText?: boolean;
  showImage?: boolean;
  layout?: "horizontal" | "vertical";
  logoUrl?: string;
  className?: string;
  height?: string;
  width?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = "dark",
  showText = true,
  showImage = true,
  layout = "vertical",
  logoUrl = LOGO_URL,
  className = "",
  height = "h-24",
  width = "w-20",
}) => {
  const textColor = variant === "light" ? "text-white" : "text-slate-900";
  const subColor = variant === "light" ? "text-white/60" : "text-orange-600";

  return (
    <div
      className={`flex ${layout === "vertical" ? "flex-col items-center text-center" : "items-center gap-3"} select-none ${className}`}
    >
      {showImage && (
        <div className={`${layout === "vertical" && showText ? "mb-4" : ""}`}>
          <div
            className={`${height} ${width} object-contain bg-white rounded-lg p-2`}
          >
            <img
              src={logoUrl}
              className={`${height} ${width} object-contain`}
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src =
                  "https://api.dicebear.com/7.x/initials/svg?seed=Elghaly";
              }}
            />
          </div>
        </div>
      )}

      {showText && (
        <div
          className={`flex flex-col ${layout === "vertical" ? "items-center" : "items-start"} leading-tight`}
        >
          <span
            className={`font-bold text-[18px] ${subColor} tracking-widest mt-1 uppercase`}
          >
            للإدارة والتوريدات
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
