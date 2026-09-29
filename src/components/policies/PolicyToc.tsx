"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Resalta la sección visible mientras se lee (scroll-spy con
// IntersectionObserver, sin escuchar el evento scroll).
export function PolicyToc({
  title,
  sections,
}: {
  title: string;
  sections: { id: string; title: string }[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <p className="eyebrow text-muted-foreground">{title}</p>
      <ol className="flex flex-col border-l border-border">
        {sections.map((section, index) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={activeId === section.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors",
                activeId === section.id
                  ? "border-accent font-medium text-accent"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {index + 1}. {section.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
