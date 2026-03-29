import React from "react";

export default function HeroSection() {
  return (
    <section className="relative w-full pt-20">
      <img
        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/ee396a0d8_ANTIAGENCIA1920x1080px1.jpg"
        alt="AntiAgencia Hero"
        className="w-full block"
        loading="eager"
      />
      <div className="absolute inset-0 pt-20 flex items-center justify-center">
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/1d3cc6998_AALogo1.png"
          alt="AntiAgencia Logo"
          className="w-48 md:w-96 lg:w-[500px]"
        />
      </div>
    </section>
  );
}
