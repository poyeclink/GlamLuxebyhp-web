"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageDropzone({ name }: { name: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // El input real (oculto) sigue siendo la fuente de verdad que el <form>
  // envía — DataTransfer es la única forma de programáticamente asignarle un
  // FileList propio, para que arrastrar-y-soltar termine en el mismo lugar
  // que elegir con el selector nativo, sin duplicar lógica de envío.
  function syncInput(nextFiles: File[]) {
    const dataTransfer = new DataTransfer();
    nextFiles.forEach((file) => dataTransfer.items.add(file));
    if (inputRef.current) inputRef.current.files = dataTransfer.files;
    setFiles(nextFiles);
  }

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((file) => ACCEPTED_TYPES.includes(file.type));
    syncInput([...files, ...incoming]);
  }

  function removeFile(index: number) {
    syncInput(files.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging ? "border-ring bg-secondary" : "border-input hover:border-ring hover:bg-muted/50",
        )}
      >
        <span className="material-symbols-outlined text-3xl text-muted-foreground" aria-hidden="true">
          upload
        </span>
        <p className="text-sm text-foreground">
          Arrastra imágenes aquí o <span className="underline">haz clic para seleccionar</span>
        </p>
        <p className="text-xs text-muted-foreground">JPEG, PNG o WEBP, máx. 5MB cada una.</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        name={name}
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        onChange={(event) => addFiles(event.target.files)}
        className="hidden"
      />

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center gap-1.5 rounded-md border border-border py-1 pl-2.5 pr-1.5 text-xs text-foreground"
            >
              {file.name}
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Quitar ${file.name}`}
                className="flex h-4 w-4 items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <span className="material-symbols-outlined text-[14px] leading-none" aria-hidden="true">
                  close
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
