import { cn } from "@/lib/utils";

// Cinta infinita solo con CSS: el contenido se duplica y la pista se desplaza
// -50%, así el loop no tiene salto. Se pausa al hover.
export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const track = [...items, ...items];
  return (
    <div className={cn("group/marquee overflow-hidden", className)}>
      <div className="flex w-max animate-marquee items-center group-hover/marquee:[animation-play-state:paused] motion-reduce:animate-none">
        {track.map((item, index) => (
          <span key={index} aria-hidden={index >= items.length} className="flex items-center">
            <span className="px-8 font-display text-2xl italic sm:text-3xl">{item}</span>
            <span className="text-accent" aria-hidden="true">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
