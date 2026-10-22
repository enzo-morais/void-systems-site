import { HowItWorks } from "@/components/home/HowItWorks";
import { pageMetadata } from "@/config/seo";
import { ReasonsSection } from "@/components/home/ReasonsSection";

export const metadata = pageMetadata("como-funciona");

export default function ComoFuncionaPage() {
  return (
    <>
      <HowItWorks />
      <ReasonsSection />
    </>
  );
}
