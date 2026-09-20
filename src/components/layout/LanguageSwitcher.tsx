import { cn } from "@/lib/utils";
import { type Locale } from "@/lib/i18n";
import { setLocaleAction } from "@/server/actions/locale-actions";

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "es", label: "ES" },
  { value: "en", label: "EN" },
];

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      {LOCALE_OPTIONS.map((option, index) => (
        <div key={option.value} className="flex items-center gap-1">
          {index > 0 ? <span className="text-muted-foreground">/</span> : null}
          <form action={setLocaleAction.bind(null, option.value)}>
            <button
              type="submit"
              aria-current={option.value === locale}
              disabled={option.value === locale}
              className={cn(
                "px-0.5 disabled:cursor-default",
                option.value === locale
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
}
