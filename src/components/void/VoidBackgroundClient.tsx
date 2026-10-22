"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const VoidBackground = dynamic(() => import("./VoidBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0, background: "#050505" }} />,
});

/** O motor de partículas existe só no login (logo animado). O resto do site usa o gradient mesh (MeshBackground). */
export function VoidBackgroundClient() {
  const pathname = usePathname();
  if (!pathname.startsWith("/login")) return null;
  return <VoidBackground />;
}
