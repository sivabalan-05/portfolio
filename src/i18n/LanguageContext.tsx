"use client";
import { createContext, useContext, ReactNode } from "react";
import dictionaries, { Lang, DictKey } from "./dictionaries";

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: DictKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  toggleLang: () => {},
  t: (key) => dictionaries.en[key] ?? String(key),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: DictKey) => dictionaries.en[key] ?? String(key);

  return (
    <LanguageContext.Provider value={{ lang: "en", toggleLang: () => {}, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT() {
  return useContext(LanguageContext);
}
