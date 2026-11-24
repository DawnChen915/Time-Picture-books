import { toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

const W = 1200;
const H = 900;

/**
 * Rasterize each [data-pdf-page] node and assemble a landscape PDF.
 * Rendering in the browser keeps Chinese fonts correct without embedding a CJK font.
 */
export async function exportBookPdf(root: HTMLElement, filename: string) {
  const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-pdf-page]"));
  const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [W, H], hotfixes: ["px_scaling"] });
  for (let i = 0; i < nodes.length; i++) {
    const dataUrl = await toJpeg(nodes[i], { width: W, height: H, pixelRatio: 2, quality: 0.92, backgroundColor: "#ffffff" });
    if (i > 0) pdf.addPage([W, H], "landscape");
    pdf.addImage(dataUrl, "JPEG", 0, 0, W, H);
  }
  pdf.save(filename);
}
