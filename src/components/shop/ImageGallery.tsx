"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

type GalleryImage = { id: string; url: string; alt: string };

export function ImageGallery({
  images,
  initialIndex = 0,
}: {
  images: GalleryImage[];
  initialIndex?: number;
}) {
  const [selected, setSelected] = useState(initialIndex);
  const active = images[selected];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {active ? (
          <Image
            src={active.url}
            alt={active.alt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-10 w-10" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelected(index)}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border bg-muted",
                index === selected ? "border-primary" : "border-border",
              )}
            >
              <Image src={image.url} alt={image.alt} fill className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
