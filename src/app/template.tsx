import { ReactNode } from "react";

// A transição entre páginas é controlada de forma unificada pelo
// PageTransitionProvider (cross-dissolve com opacity + scale).
// Aqui só repassamos o conteúdo para não haver animações concorrentes.
export default function Template({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
