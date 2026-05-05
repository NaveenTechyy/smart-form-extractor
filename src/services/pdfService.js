import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.mjs?worker&inline";

// Create a pool of worker instances
let workerPool = [];
const MAX_WORKERS = 1;

function getWorker() {
  if (workerPool.length > 0) {
    return workerPool.pop();
  }
  return new PdfWorker();
}

function releaseWorker(worker) {
  if (workerPool.length < MAX_WORKERS) {
    workerPool.push(worker);
  } else {
    worker.terminate();
  }
}

pdfjsLib.GlobalWorkerOptions.workerPort = getWorker();

export const loadPDF = async file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const pdf = await pdfjsLib.getDocument({ data: e.target.result })
          .promise;
        resolve(pdf);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const renderPDFPage = async (pdf, pageNum, canvas) => {
  try {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const context = canvas.getContext("2d");
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return viewport;
  } catch (error) {
    console.error("Error rendering PDF page:", error);
    throw error;
  }
};

export const bboxToPixels = (bbox, canvasWidth, canvasHeight) => {
  return {
    top: bbox.top * canvasHeight,
    left: bbox.left * canvasWidth,
    width: bbox.width * canvasWidth,
    height: bbox.height * canvasHeight,
  };
};

export const getPDFAsBase64 = file => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
