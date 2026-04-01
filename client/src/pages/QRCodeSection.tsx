import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";

const PAYSTACK_LINK = "https://paystack.com/pay/pcn-first-abuja-parish"; // Replace with real link
const SCAN_ME_TEXT = "SCAN ME";

export default function QRCodeSection() {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgData = serializer.serializeToString(svg);
    const qrSize = 200;
    const paddingX = 48;
    const paddingTop = 48;
    const labelGap = 22;
    const labelHeight = 34;
    const bottomPadding = 48;
    const outputWidth = qrSize + paddingX * 2;
    const outputHeight = paddingTop + qrSize + labelGap + labelHeight + bottomPadding;
    const qrX = (outputWidth - qrSize) / 2;
    const labelY = paddingTop + qrSize + labelGap;

    const centeredSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}" viewBox="0 0 ${outputWidth} ${outputHeight}">
        <rect width="100%" height="100%" fill="#ffffff" />
        <g transform="translate(${qrX}, ${paddingTop})">
          ${svgData.replace(/^<svg[^>]*>|<\/svg>$/g, "")}
        </g>
        <text x="${outputWidth / 2}" y="${labelY}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="4" fill="#1f2937">
          ${SCAN_ME_TEXT}
        </text>
      </svg>
    `;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      ctx?.drawImage(img, 0, 0);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `pcn-giving-qr-${new Date().toISOString().split("T")[0]}.png`;
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(centeredSvg)));
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a2a6e] to-[#0f1a4a] border border-[#2a3a80] p-10 text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />

      <div className="relative grid md:grid-cols-2 gap-10 items-center md:items-start">

        {/* Left: Text */}
        <div className="space-y-5 md:pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25">
            <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">Give Instantly</span>
          </div>
          <h2 style={{ fontFamily: "'Sora', system-ui, sans-serif" }} className="text-3xl font-bold">
            Scan to Give Online
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            Point your phone camera at the QR code to go directly to our secure Paystack giving page. No typing, no hassle — just scan and give.
          </p>
          <ul className="space-y-2 text-sm text-blue-200">
            {[
              "✦ Secure payment via Paystack",
              "✦ Works on any smartphone",
              "✦ Instant confirmation",
              "✦ All giving types accepted",
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            
            <a
              href={PAYSTACK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              Give Online →
            </a>
            <button
              onClick={downloadQRCode}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all"
            >
              Download QR Code
            </button>
          </div>
        </div>

        {/* Right: QR Code */}
        <div className="flex flex-col items-center gap-4 md:pt-2">
          <div className="p-5 rounded-2xl bg-white shadow-2xl shadow-black/40 flex items-center justify-center" ref={qrRef}>
            <QRCodeSVG
              value={PAYSTACK_LINK}
              size={200}
              level="H"
              includeMargin={false}
              fgColor="#0f1a4a"
              bgColor="#ffffff"
            />
          </div>
          <p className="text-blue-300 text-xs text-center max-w-[200px] mx-auto">
            Scan with your phone camera to open the secure giving page
          </p>
        </div>

      </div>
    </div>
  );
}
