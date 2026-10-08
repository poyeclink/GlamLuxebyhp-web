"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/Button";

const MAX_SIDE = 640;

// Se reduce en el navegador antes de subir: una foto de teléfono pesa varios
// MB y supera el límite de cuerpo de los Server Actions / funciones de Vercel.
async function shrink(file: File) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d")!;
  // Fondo blanco: un PNG transparente pasado a JPEG quedaría negro.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85),
  );
  return blob ? new File([blob], "avatar.jpg", { type: "image/jpeg" }) : file;
}

export type AvatarInputCopy = { choose: string; change: string; hint: string };

export function AvatarInput({
  initialUrl,
  fallback,
  copy,
  onChange,
}: {
  initialUrl?: string | null;
  fallback: string;
  copy: AvatarInputCopy;
  onChange?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(initialUrl ?? null);

  useEffect(
    () => () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    },
    [preview],
  );

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const small = await shrink(file).catch(() => file);
    const transfer = new DataTransfer();
    transfer.items.add(small);
    input.files = transfer.files;
    setPreview(URL.createObjectURL(small));
    onChange?.();
  }

  const pick = () => inputRef.current?.click();

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={pick}
        aria-label={preview ? copy.change : copy.choose}
        className="group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-accent-soft text-accent transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {preview ? (
          <Image
            src={preview}
            alt=""
            fill
            sizes="80px"
            unoptimized={preview.startsWith("blob:")}
            className="object-cover"
          />
        ) : fallback ? (
          <span className="font-display text-3xl">{fallback}</span>
        ) : (
          <Camera className="h-6 w-6" aria-hidden="true" />
        )}
        <span className="absolute inset-x-0 bottom-0 flex justify-center bg-inverse/60 py-1 text-inverse-foreground opacity-0 transition-opacity group-hover:opacity-100">
          <Camera className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </button>
      <div className="flex flex-col items-start gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={pick}>
          <Camera className="h-4 w-4" aria-hidden="true" />
          {preview ? copy.change : copy.choose}
        </Button>
        <p className="text-xs text-muted-foreground">{copy.hint}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        onChange={handleChange}
      />
    </div>
  );
}
