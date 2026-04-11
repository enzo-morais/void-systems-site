"use client";

interface VoidCardProps {
  children: React.ReactNode;
  className?: string;
}

export function VoidCard({ children, className = "" }: VoidCardProps) {
  return (
    <div
      className={`group relative rounded-lg p-6 transition-all duration-300 backdrop-blur-md ${className}`}
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
      }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
