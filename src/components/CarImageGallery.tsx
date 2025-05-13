"use client";

import { useState } from "react";
import Image from "next/image";

interface CarImageGalleryProps {
  images: string[];
}

export default function CarImageGallery({ images }: CarImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images.length) {
    return (
      <div className="flex w-full gap-2.5 overflow-x-auto">
        <div className="w-[100px] h-[104px] flex-shrink-0 rounded bg-[#DDD]" />
      </div>
    );
  }

  return (
    <div className="flex w-full gap-2.5 overflow-x-auto">
      {images.map((image, index) => (
        <div
          key={index}
          className={`w-[100px] h-[104px] flex-shrink-0 rounded relative overflow-hidden cursor-pointer ${
            selectedImage === index ? 'border-2 border-[#EA580C]' : ''
          }`}
          onClick={() => setSelectedImage(index)}
        >
          <Image
            src={image}
            alt={`Car image ${index + 1}`}
            fill
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
