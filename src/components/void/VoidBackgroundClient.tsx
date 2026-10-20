"use client";

import dynamic from "next/dynamic";

const VoidBackground = dynamic(() => import("./VoidBackground"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-black pointer-events-none" style={{ zIndex: 0 }} />,
});

export function VoidBackgroundClient() {
  return <VoidBackground />;
}
