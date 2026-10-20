import { ViewTransition } from "react";

// O template remonta a cada navegação, então o conteúdo antigo "sai" (page-out) e o novo "entra" (page-in).
// As animações estão em globals.css. A página carrega normalmente enquanto isso: nada atrasa a navegação.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition default="none" enter="page-in" exit="page-out">
      {children}
    </ViewTransition>
  );
}
