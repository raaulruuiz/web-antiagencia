import React from "react";

export default function HeroSection() {
  return (
    <section className="relative w-full pt-20">
      <img
        src="/images/ee396a0d8_ANTIAGENCIA1920x1080px1.jpg"
        alt="AntiAgencia Hero"
        className="w-full block"
        loading="eager"
      />
      <div className="absolute inset-0 pt-20 flex items-center justify-center">
        <img
          src="/images/1d3cc6998_AALogo1.png"
          alt="AntiAgencia Logo"
          className="w-48 md:w-96 lg:w-[500px]"
        />
      </div>
    </section>
  );
}
