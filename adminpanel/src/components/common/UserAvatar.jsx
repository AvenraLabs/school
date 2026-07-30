import React, { useState, useEffect } from 'react';
import { getApiAssetUrl } from '../../api/axios';

export function UserAvatar({ src, name, fallbackChar = 'U', size = 'w-7 h-7', className = '' }) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const initial = name ? name.trim()[0]?.toUpperCase() : fallbackChar;

  if (!src || imgError) {
    return (
      <div
        className={`${size} rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-xs border border-[#D3E6E0] overflow-hidden shrink-0 ${className}`}
      >
        {initial || fallbackChar}
      </div>
    );
  }

  return (
    <div
      className={`${size} rounded-full bg-[#EAF3F0] text-[#2F6F5E] flex items-center justify-center font-bold text-xs border border-[#D3E6E0] overflow-hidden shrink-0 ${className}`}
    >
      <img
        src={getApiAssetUrl(src)}
        alt={name || 'Avatar'}
        className="w-full h-full object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default UserAvatar;
