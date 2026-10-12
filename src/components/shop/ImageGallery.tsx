"use client";

import { useState } from "react";
import Image from "next/image";
import { Isotipo } from "@/components/brand/Logo";
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

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        {/* Todas apiladas para fundir una en otra al cambiar (montar solo la
            activa la cambiaba de golpe). */}
        {images.length > 0 ? (
          images.map((image, index) => (
            <Image
              key={image.id}
              src={image.url}
              alt={index === selected ? image.alt : ""}
              aria-hidden={index !== selected}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              priority={index === initialIndex}
              className={cn(
                "object-cover transition-[opacity,scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                index === selected ? "scale-100 opacity-100" : "scale-[1.03] opacity-0",
              )}
            />
          ))
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Isotipo className="h-auto w-28 text-muted-foreground/40 [--logo-accent:currentColor]" title="" />
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
              aria-current={index === selected}
              className={cn(
                "relative h-16 w-16 overflow-hidden rounded-md border bg-muted transition-[opacity,border-color] duration-300",
                index === selected ? "border-primary" : "border-border opacity-60 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt={image.alt} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
