import React from "react";

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <img
      src="/logo.jpg"
      alt="أبناء الغالي"
      className={className}
      style={{ maxWidth: "100%", height: "auto", display: "block" }}
    />
  );
};

export default Logo;
