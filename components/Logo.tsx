
import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <img 
        src="/logo.jpg" 
        alt="شعار أبناء الغالي" 
        className="max-w-full h-auto block"
      />
    </div>
  );
};

export default Logo;
