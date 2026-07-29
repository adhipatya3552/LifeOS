"use client";

import { BlogSection } from "@/components/marketing/BlogSection";
import { CtaCommandBar } from "@/components/marketing/CtaCommandBar";
import { FeatureBento } from "@/components/marketing/FeatureBento";
import { HeroStage } from "@/components/marketing/HeroStage";
import { NavBar } from "@/components/marketing/NavBar";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { TrustArchitecture } from "@/components/marketing/TrustArchitecture";

export function LandingPageClient() {
  return (
    <div
      className="min-h-screen w-full max-w-full overflow-x-clip"
      style={{ background: "var(--color-bg)" }}
    >
      <NavBar />
      <HeroStage />
      <FeatureBento />
      <TrustArchitecture />
      <BlogSection />
      <CtaCommandBar />
      <SiteFooter />
    </div>
  );
}
