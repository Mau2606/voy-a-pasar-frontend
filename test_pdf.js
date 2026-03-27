import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import fs from 'fs';

async function checkLabels() {
  const data = new Uint8Array(fs.readFileSync('../backend/uploads/pdfs/fb214b7e-9cbe-4feb-bb79-76decd97f741_cap 01.pdf'));
  const doc = await pdfjsLib.getDocument({data}).promise;
  const labels = await doc.getPageLabels();
  console.log("Labels:", labels);
}
checkLabels().catch(console.error);
