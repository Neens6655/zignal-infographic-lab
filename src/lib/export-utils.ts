/* ═══════════════════════════════════════════════════════════════
   ZGNAL — Shared Export Utilities
   Extracted from result-viewer.tsx for reuse in chat + main UI
   ═══════════════════════════════════════════════════════════════ */

async function loadImageAsBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

async function loadImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 1920, height: 1080 });
    img.src = url;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportAsJpeg(url: string) {
  const img = new window.Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob>((resolve) =>
    canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92)
  );
  triggerDownload(blob, 'zignal-infographic.jpg');
}

export async function exportAsPdf(url: string) {
  const { jsPDF } = await import('jspdf');
  const { width, height } = await loadImageDimensions(url);
  const isLandscape = width > height;
  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [width, height],
  });
  const blob = await loadImageAsBlob(url);
  const dataUrl = await blobToDataUrl(blob);
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save('zignal-infographic.pdf');
}

export async function exportAsPptx(url: string) {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const { width, height } = await loadImageDimensions(url);
  const pptx = new PptxGenJS();
  const isLandscape = width > height;
  pptx.defineLayout({ name: 'CUSTOM', width: isLandscape ? 13.33 : 7.5, height: isLandscape ? 7.5 : 13.33 });
  pptx.layout = 'CUSTOM';
  const slide = pptx.addSlide();
  slide.background = { color: '0A0A0B' };
  const blob = await loadImageAsBlob(url);
  const dataUrl = await blobToDataUrl(blob);
  const base64 = dataUrl.split(',')[1];
  const slideW = isLandscape ? 13.33 : 7.5;
  const slideH = isLandscape ? 7.5 : 13.33;
  const imgAspect = width / height;
  let imgW = slideW;
  let imgH = imgW / imgAspect;
  if (imgH > slideH) { imgH = slideH; imgW = imgH * imgAspect; }
  const x = (slideW - imgW) / 2;
  const y = (slideH - imgH) / 2;
  slide.addImage({ data: `image/png;base64,${base64}`, x, y, w: imgW, h: imgH });
  await pptx.writeFile({ fileName: 'zignal-infographic.pptx' });
}

export async function exportAsPng(url: string) {
  const blob = await loadImageAsBlob(url);
  triggerDownload(blob, 'zignal-infographic.png');
}
