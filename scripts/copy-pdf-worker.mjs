import { mkdirSync, copyFileSync } from 'node:fs';
mkdirSync('public/pdf', { recursive: true });
copyFileSync('node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/pdf/pdf.worker.min.mjs');
