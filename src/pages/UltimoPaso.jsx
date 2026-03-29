import React from "react";
import FooterMinimal from "@/components/landing/FooterMinimal";

export default function UltimoPaso() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center px-6 pt-16 pb-16">

        {/* Logo */}
        <img
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697678eac9cf34e2aefb7d57/6130113b7_AALogo.png"
          alt="AntiAgencia"
          className="h-14 w-auto mb-10"
        />

        {/* Título */}
        <h1 className="font-headline font-bold text-white text-3xl md:text-5xl text-center tracking-widest mb-8">
          AÚN NO ESTÁS EN LA LISTA
        </h1>

        {/* Texto principal */}
        <p className="font-body text-white/70 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          Te acaba de llegar a tu mail un correo donde podrás confirmar tu correo para recibir los regalos.
          <br /><br />
          Puede que esté en spam o en la bandeja de notificaciones, en ese caso añade la dirección raul@antiagencia.es a tu lista de contactos.
        </p>

        {/* Subtítulo */}
        <h2 className="font-headline font-bold text-white text-xl md:text-2xl text-center tracking-widest mb-6">
          MUY IMPORTANTE
        </h2>

        {/* Texto regalo secreto */}
        <p className="font-body text-white/70 text-base md:text-lg text-center max-w-xl leading-relaxed mb-10">
          Una vez confirmes tu suscripción se abrirá una nueva página (no la cierres) donde tendrás acceso a un{" "}
          <strong className="text-white">REGALO SECRETO</strong>
        </p>

        {/* Botones de confirmación */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-6">
          <a
            href="https://accounts.google.com/ServiceLogin/identifier?service=mail&passive=true&rm=false&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&ss=1&scc=1&ltmpl=default&ltmplcache=2&emr=1&osid=1&flowName=GlifWebSignIn&flowEntry=AddSession"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center font-headline font-bold text-white bg-[#EA4335] hover:bg-[#c5362a] transition-colors text-sm md:text-base px-6 py-4 rounded-lg tracking-widest"
          >
            Confirmar registro en Gmail
          </a>
          <a
            href="https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1515432288&rver=6.7.6640.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fauthRedirect%3dtrue%26RpsCsrfState%3dc7e7df42-2b76-1fea-435a-fce96b8b24e3&id=292841&whr=hotmail.com&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center font-headline font-bold text-white bg-[#0078D4] hover:bg-[#005fa3] transition-colors text-sm md:text-base px-6 py-4 rounded-lg tracking-widest"
          >
            Confirmar registro en Outlook
          </a>
        </div>

        {/* Texto bajo los botones */}
        <p className="font-body text-white/40 text-sm text-center max-w-md leading-relaxed">
          Si el mail que has puesto no es ninguno de estos dos, no pasa nada. El proceso es el mismo.
        </p>

      </div>

      <FooterMinimal />
    </div>
  );
}
