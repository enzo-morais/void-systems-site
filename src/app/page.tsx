import { VoidBackground } from "@/components/landing/void-background";
import { Header } from "@/components/landing/header";

export default function Home() {
  return (
    <>
      <VoidBackground />
      <Header />

      <main className="relative z-10 min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
        <p className="text-silver/50 text-center">Nova página inicial em construção.</p>
      </main>
    </>
  );
}
