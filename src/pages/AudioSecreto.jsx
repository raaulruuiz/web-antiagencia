import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function AudioSecreto() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full">
          <div className="flex justify-center mb-8">
            <img src="/images/cf4d75d1a_freepik__background__33914.png" alt="AntiAgencia" className="h-10" />
          </div>
          <h1 className="font-headline font-bold text-3xl md:text-4xl text-center mb-8">
            Audio Secreto
          </h1>
          <audio
            controls
            className="w-full"
            src="/audios/AUDIO-2026-04-06-14-39-18.m4a"
          />
          <p className="font-body text-center mt-8">
            <a href="/trabajaconnosotros" className="text-black underline hover:opacity-60">
              Por si quieres trabajar con nosotros
            </a>
          </p>
        </div>
      </div>
      <FooterMinimal />
    </div>
  );
}
