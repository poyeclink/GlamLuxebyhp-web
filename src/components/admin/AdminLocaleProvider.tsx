"use client";

import { createContext, useContext, useMemo } from "react";
import { adminTranslator } from "@/lib/admin-i18n";
import type { Locale } from "@/lib/i18n";

const AdminLocaleContext = createContext<Locale>("en");

export function AdminLocaleProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <AdminLocaleContext.Provider value={locale}>{children}</AdminLocaleContext.Provider>;
}

export function useAdminLocale() {
  return useContext(AdminLocaleContext);
}

export function useAdminT() {
  const locale = useAdminLocale();
  return useMemo(() => adminTranslator(locale), [locale]);
}
