"use client";

import { useState } from "react";

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string; // optional fallback image
}

export default function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [error, setError] = useState(false);

  if (error && fallback) {
    return <img src={fallback} alt={alt} className={className} />;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => {
        console.error("❌ Image failed to load:", src);
        setError(true);
      }}
    />
  );
}
