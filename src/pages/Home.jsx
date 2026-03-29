import React from "react";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FounderQuoteSection from "@/components/landing/FounderQuoteSection";
import TimelineSection from "@/components/landing/TimelineSection";
import ImageGridSection from "@/components/landing/ImageGridSection";
import MobileStickyBar from "@/components/landing/MobileStickyBar";
import PhilosophySection from "@/components/landing/PhilosophySection";
import LogoCrossSection from "@/components/landing/LogoCrossSection";
import StrategySection from "@/components/landing/StrategySection";
import HablamosSection from "@/components/landing/HablamosSection";
import SocialSection from "@/components/landing/SocialSection";
import TeamSection from "@/components/landing/TeamSection";
import BrandsSection from "@/components/landing/BrandsSection";
import CreativeCarousel from "@/components/landing/CreativeCarousel";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#121212]">
      <Navbar />
      <main className="pb-28 md:pb-0">
        <HeroSection />
        <FounderQuoteSection />
        <TimelineSection />
        <ImageGridSection />
        <PhilosophySection />
        <LogoCrossSection />
        <StrategySection />
        <HablamosSection />
        <SocialSection />
        <TeamSection />
        <BrandsSection />
        <CreativeCarousel />
        <Footer />
      </main>
      <MobileStickyBar />
    </div>
  );
}
