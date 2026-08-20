"use client";

import { useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, FileImage, FileText, LoaderCircle } from "lucide-react";
import { useClickOutside } from "@/lib/hooks/use-click-outside";

async function captureDataUrl(node: HTMLElement) {
  const { toPng } = await import("html-to-image");
  return toPng(node, {
    backgroundColor: "#ffffff",
    pixelRatio: 3,
    cacheBust: true,
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function ExportMenu({ targetRef }: { targetRef: RefObject<HTMLDivElement | null> }) {
  const [open, setOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useClickOutside(containerRef, () => setOpen(false), open);

  async function handleExportPng() {
    if (!targetRef.current || exporting) return;
    setOpen(false);
    setExporting(true);
    try {
      const dataUrl = await captureDataUrl(targetRef.current);
      downloadDataUrl(dataUrl, "horario-novaclass.png");
    } catch {
      // La exportación falló silenciosamente; el usuario puede reintentar.
    } finally {
      setExporting(false);
    }
  }

  async function handleExportPdf() {
    if (!targetRef.current || exporting) return;
    setOpen(false);
    setExporting(true);
    try {
      const [dataUrl, { jsPDF }] = await Promise.all([
        captureDataUrl(targetRef.current),
        import("jspdf"),
      ]);
      const img = await loadImage(dataUrl);
      const orientation = img.width >= img.height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation, unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 28;
      const maxWidth = pageWidth - margin * 2;
      const maxHeight = pageHeight - margin * 2;
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;
      pdf.addImage(
        dataUrl,
        "PNG",
        (pageWidth - width) / 2,
        (pageHeight - height) / 2,
        width,
        height
      );
      pdf.save("horario-novaclass.pdf");
    } catch {
      // La exportación falló silenciosamente; el usuario puede reintentar.
    } finally {
      setExporting(false);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        disabled={exporting}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-center gap-2 rounded-full border border-nova-navy/10 px-4 py-2 text-[13px] font-medium text-nova-navy/70 transition-colors hover:bg-nova-navy/[0.03] disabled:opacity-60 sm:w-auto sm:justify-start"
      >
        {exporting ? (
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
        )}
        Exportar
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-20 mt-2 w-52 rounded-2xl border border-nova-navy/5 bg-nova-white p-2 shadow-[0_20px_40px_-20px_rgba(4,14,60,0.4)]"
          >
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-nova-navy/70 hover:bg-nova-navy/[0.04]"
            >
              <FileText className="h-3.5 w-3.5 text-nova-electric" strokeWidth={1.75} />
              Exportar como PDF
            </button>
            <button
              type="button"
              onClick={handleExportPng}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-nova-navy/70 hover:bg-nova-navy/[0.04]"
            >
              <FileImage className="h-3.5 w-3.5 text-nova-electric" strokeWidth={1.75} />
              Exportar como PNG
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
