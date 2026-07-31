"use client";

import Image from "next/image";
import { useId } from "react";

const LOGOS = [
  { src: "/images/partners/hdfc.png", alt: "HDFC Bank" },
  { src: "/images/partners/icici.png", alt: "ICICI Bank" },
  { src: "/images/partners/axis.png", alt: "Axis Bank" },
  { src: "/images/partners/kotak.png", alt: "Kotak Mahindra Bank" },
  { src: "/images/partners/indusind.png", alt: "IndusInd Bank" },
  { src: "/images/partners/idfc.png", alt: "IDFC First Bank" },
  { src: "/images/partners/YESBANKLOGO.png", alt: "Yes Bank" },
  { src: "/images/partners/bajaj.png", alt: "Bajaj Finserv" },
  { src: "/images/partners/bandhan.png", alt: "Bandhan Bank" },
  { src: "/images/partners/axis-finance.jpg", alt: "Axis Finance" },
  { src: "/images/partners/cholamandalam.png", alt: "Cholamandalam" },
  { src: "/images/partners/Aditya_left.png", alt: "Aditya Birla Capital" },
  { src: "/images/partners/finnable.png", alt: "Finnable" },
  { src: "/images/partners/capital.jpg", alt: "Tata Capital" },
  { src: "/images/partners/incred.jpg", alt: "InCred" },
  { src: "/images/partners/lnt.avif", alt: "L&T Finance" },
  { src: "/images/partners/smfg.png", alt: "SMFG India Credit" },
];

function Track() {
  const id = useId();
  const duration = Math.max(25, LOGOS.length * 2.5);

  return (
    <div className="relative overflow-hidden">
      <style>{`@keyframes scroll-${id} { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }`}</style>
      <div
        className="flex w-max flex-nowrap gap-6 py-2"
        style={{
          width: "max-content",
          animation: `scroll-${id} ${duration}s linear infinite normal`,
        }}
      >
        {[...LOGOS, ...LOGOS].map((logo, i) => (
          <div
            key={i}
            className="flex h-14 shrink-0 items-center justify-center rounded-lg bg-canvas px-5 shadow-elevation-xs ring-1 ring-hairline-soft"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              width={144}
              height={36}
              className="max-h-9 w-auto max-w-36 object-contain"
              loading="lazy"
              sizes="144px"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnimatedLogoBar() {
  return (
    <div className="overflow-hidden">
      <Track />
    </div>
  );
}
