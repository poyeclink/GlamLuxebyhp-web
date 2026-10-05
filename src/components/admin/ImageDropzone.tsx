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
          "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors outline-none focus-visible:border-ring active:bg-muted/60 [-webkit-tap-highlight-color:transparent]",
          isDragging
            ? "border-ring bg-secondary"
            : "border-input hover:border-ring hover:bg-muted/50",
        )}
      >
        <span
          className="material-symbols-outlined flex h-12 w-12 items-center justify-center rounded-full bg-muted text-[26px] text-foreground"
          aria-hidden="true"
        >
          add_photo_alternate
        </span>
        <p className="text-base font-medium text-foreground sm:text-sm">
          Agregar fotos
          <span className="hidden font-normal text-muted-foreground md:inline">
            {" "}
            o arrástralas aquí
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          Desde la galería o la cámara · JPEG, PNG o WEBP, máx. 5MB cada una.
        </p>
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
        <ul className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex min-w-0 items-center gap-1.5 rounded-md border border-border py-0.5 pl-3 pr-0.5 text-sm text-foreground sm:text-xs"
            >
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                aria-label={`Quitar ${file.name}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground sm:h-6 sm:w-6"
              >
                <span
                  className="material-symbols-outlined text-[18px] leading-none sm:text-[14px]"
                  aria-hidden="true"
                >
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
