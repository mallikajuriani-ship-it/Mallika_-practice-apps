import * as XLSX from 'xlsx';
import { UploadedFileState } from '../types';

export async function parseUploadedFile(file: File): Promise<UploadedFileState> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const size = file.size;

  // Max 25MB check
  if (size > 25 * 1024 * 1024) {
    return {
      file,
      name: file.name,
      size,
      type: extension,
      mimeType: file.type || 'application/octet-stream',
      status: 'error',
      errorMessage: 'File size exceeds 25MB limit. Please upload a smaller version.',
    };
  }

  try {
    // 1. Text formats: CSV, TXT, TSV, JSON, MD
    if (['csv', 'txt', 'tsv', 'json', 'md', 'xml'].includes(extension) || file.type.startsWith('text/')) {
      const text = await file.text();
      return {
        file,
        name: file.name,
        size,
        type: extension.toUpperCase(),
        mimeType: file.type || 'text/plain',
        textContent: text,
        status: 'ready',
      };
    }

    // 2. Spreadsheet formats: XLSX, XLS
    if (['xlsx', 'xls'].includes(extension)) {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      const textParts: string[] = [];

      sheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          const csvContent = XLSX.utils.sheet_to_csv(worksheet);
          textParts.push(`--- SHEET: ${sheetName} ---\n${csvContent}\n`);
        }
      });

      return {
        file,
        name: file.name,
        size,
        type: extension.toUpperCase(),
        mimeType: 'text/csv',
        textContent: textParts.join('\n'),
        status: 'ready',
      };
    }

    // 3. PDF format
    if (extension === 'pdf' || file.type === 'application/pdf') {
      const base64 = await fileToBase64(file);
      return {
        file,
        name: file.name,
        size,
        type: 'PDF',
        mimeType: 'application/pdf',
        base64,
        status: 'ready',
      };
    }

    // 4. Image formats: PNG, JPG, JPEG, WEBP
    if (['png', 'jpg', 'jpeg', 'webp'].includes(extension) || file.type.startsWith('image/')) {
      const base64 = await fileToBase64(file);
      return {
        file,
        name: file.name,
        size,
        type: extension.toUpperCase(),
        mimeType: file.type || `image/${extension === 'jpg' ? 'jpeg' : extension}`,
        base64,
        status: 'ready',
      };
    }

    // 5. DOCX / Word formats (simple text extraction from docx zip XML or fallback)
    if (extension === 'docx') {
      try {
        const text = await extractDocxText(file);
        return {
          file,
          name: file.name,
          size,
          type: 'DOCX',
          mimeType: 'text/plain',
          textContent: text,
          status: 'ready',
        };
      } catch {
        // Fallback: read text representation
        const raw = await file.text();
        return {
          file,
          name: file.name,
          size,
          type: 'DOCX',
          mimeType: 'text/plain',
          textContent: raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').slice(0, 50000),
          status: 'ready',
        };
      }
    }

    // 6. Generic fallback: try text reading
    const text = await file.text();
    return {
      file,
      name: file.name,
      size,
      type: extension.toUpperCase() || 'FILE',
      mimeType: file.type || 'text/plain',
      textContent: text,
      status: 'ready',
    };
  } catch (err: any) {
    console.error('Error parsing file:', err);
    return {
      file,
      name: file.name,
      size,
      type: extension.toUpperCase(),
      mimeType: file.type || 'application/octet-stream',
      status: 'error',
      errorMessage: err.message || 'Failed to read document contents. Please check if the file is corrupted.',
    };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data url prefix (e.g. "data:application/pdf;base64,")
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

async function extractDocxText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Simple XML paragraph extraction from document.xml within zip
  const uint8 = new Uint8Array(arrayBuffer);
  // Convert binary to string to search for XML tags
  let binaryString = '';
  for (let i = 0; i < uint8.length; i++) {
    binaryString += String.fromCharCode(uint8[i]);
  }

  // Look for word/document.xml content
  const xmlMatches = binaryString.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
  if (xmlMatches && xmlMatches.length > 0) {
    return xmlMatches
      .map((tag) => tag.replace(/<[^>]+>/g, ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return 'Word document loaded.';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
