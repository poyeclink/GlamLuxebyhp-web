"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Download, SquarePlus, Share } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDismiss } from "@/hooks/use-dismiss";

// No está en los tipos de lib.dom: solo existe en navegadores Chromium.
type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void> };

export type InstallAppCopy = {
  title: string;
  text: string;
  cta: string;
  iosTitle: string;
  iosStep1: string;
  iosStep2: string;
};

const subscribeNever = () => () => {};

function getPlatform(): "installed" | "ios" | "other" {
  if (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  ) {
    return "installed";
  }
  const isIos =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);
  return isIos ? "ios" : "other";
}

// Safari iOS no dispara `beforeinstallprompt`: ahí el botón muestra los pasos
// de "Agregar a inicio". En navegadores sin soporte (o con la app ya
// instalada) la tarjeta no se muestra, para no ofrecer algo que no funciona.
export function InstallAppCard({ copy }: { copy: InstallAppCopy }) {
  // "installed" en el servidor: la tarjeta solo aparece tras hidratar, sin
  // desajuste de HTML.
  const platform = useSyncExternalStore(subscribeNever, getPlatform, () => "installed" as const);
  const [promptReady, setPromptReady] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const promptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeSteps = useCallback(() => setShowSteps(false), []);
  useDismiss(containerRef, showSteps, closeSteps);

  useEffect(() => {
    if (platform !== "other") return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      promptRef.current = event as BeforeInstallPromptEvent;
      setPromptReady(true);
    };
    const onInstalled = () => {
      promptRef.current = null;
      setPromptReady(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [platform]);

  const mode =
    platform === "ios" ? "ios" : platform === "other" && promptReady ? "prompt" : "hidden";

  async function install() {
    if (mode === "ios") {
      setShowSteps((value) => !value);
      return;
    }
    const event = promptRef.current;
    if (!event) return;
    // Un prompt solo se puede usar una vez: se oculta la tarjeta hasta que
    // Chrome vuelva a disparar `beforeinstallprompt` (si el usuario lo rechazó).
    promptRef.current = null;
    setPromptReady(false);
    await event.prompt();
  }

  if (mode === "hidden") return null;

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-sm animate-fade-up items-center gap-4 rounded-2xl border border-inverse-border bg-inverse-border/30 p-3 pr-4"
    >
      <Image
        src="/icons/icon-192.png"
        alt=""
        width={56}
        height={56}
        className="h-14 w-14 shrink-0 rounded-xl ring-1 ring-inverse-border"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-sm font-medium text-inverse-foreground">{copy.title}</span>
        <span className="text-xs leading-snug text-inverse-muted">{copy.text}</span>
      </div>
      <button
        type="button"
        onClick={install}
        aria-expanded={mode === "ios" ? showSteps : undefined}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-inverse-accent px-4 py-2 text-xs font-semibold text-inverse transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-12px_rgba(92,184,240,0.6)]"
      >
        <Download className="h-3.5 w-3.5" aria-hidden="true" />
        {copy.cta}
      </button>

      {mode === "ios" && (
        <div
          role="dialog"
          aria-label={copy.iosTitle}
          className={cn(
            "absolute bottom-full left-0 right-0 z-10 mb-3 rounded-2xl bg-background p-5 text-foreground shadow-[0_24px_60px_-20px_rgba(0,0,0,0.7)]",
            "transition-[opacity,translate,scale,visibility] duration-300",
            showSteps ? "visible translate-y-0 opacity-100" : "invisible translate-y-2 opacity-0",
          )}
        >
          <p className="font-display text-lg">{copy.iosTitle}</p>
          <ol className="mt-3 flex flex-col gap-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Share className="h-4 w-4" aria-hidden="true" />
              </span>
              {copy.iosStep1}
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <SquarePlus className="h-4 w-4" aria-hidden="true" />
              </span>
              {copy.iosStep2}
            </li>
          </ol>
        </div>
      )}
    </div>
  );
}
