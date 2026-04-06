import { Injectable } from '@angular/core';

// Minimal PDF generator for plain monospace text — no dependencies.
// A4: 595 x 842 pt, margins 56pt (~20mm), Courier font.
@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly PAGE_W = 595;
  private readonly PAGE_H = 842;
  private readonly MARGIN = 56;
  private readonly FONT_SIZE = 10;
  private readonly LINE_H = 14;
  private readonly CHAR_W = 0.6 * 10;

  public exportText(text: string, filename = 'song_chords.pdf'): void {
    const usableW = this.PAGE_W - this.MARGIN * 2;
    const usableH = this.PAGE_H - this.MARGIN * 2;
    const charsPerLine = Math.floor(usableW / this.CHAR_W);
    const linesPerPage = Math.floor(usableH / this.LINE_H);

    const wrappedLines = this.wrapLines(text.split('\n'), charsPerLine);
    const pages = this.paginate(wrappedLines, linesPerPage);

    const pdf = this.buildPdf(pages);
    this.download(pdf, filename);
  }

  private wrapLines(lines: string[], maxChars: number): string[] {
    const result: string[] = [];
    for (const line of lines) {
      if (line.length === 0) {
        result.push('');
        continue;
      }
      let remaining = line;
      while (remaining.length > maxChars) {
        result.push(remaining.slice(0, maxChars));
        remaining = remaining.slice(maxChars);
      }
      result.push(remaining);
    }
    return result;
  }

  private paginate(lines: string[], linesPerPage: number): string[][] {
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += linesPerPage) {
      pages.push(lines.slice(i, i + linesPerPage));
    }
    return pages.length ? pages : [[]];
  }

  private escapePdfString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  }

  private buildPdf(pages: string[][]): Uint8Array {
    const objects: string[] = [];
    const offsets: number[] = [];

    const push = (obj: string): number => {
      objects.push(obj);
      return objects.length;
    };

    push(''); // 1: Catalog placeholder
    push(''); // 2: Pages placeholder

    const contentIds: number[] = [];
    for (const lines of pages) {
      let stream = 'BT\n';
      stream += `/F1 ${this.FONT_SIZE} Tf\n`;
      const startY = this.PAGE_H - this.MARGIN - this.FONT_SIZE;
      stream += `${this.MARGIN} ${startY} Td\n`;
      stream += `${this.LINE_H} TL\n`;
      for (const line of lines) {
        stream += `(${this.escapePdfString(line)}) Tj T*\n`;
      }
      stream += 'ET';

      const streamBytes = new TextEncoder().encode(stream);
      const contentId = push(
        `<< /Length ${streamBytes.length} >>\nstream\n${stream}\nendstream`
      );
      contentIds.push(contentId);
    }

    const pageObjIds: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      pageObjIds.push(
        push(
          `<< /Type /Page /Parent 2 0 R ` +
            `/MediaBox [0 0 ${this.PAGE_W} ${this.PAGE_H}] ` +
            `/Contents ${contentIds[i]} 0 R ` +
            `/Resources << /Font << /F1 ${objects.length + 2} 0 R >> >> >>`
        )
      );
    }

    push(
      '<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>'
    );

    objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
    const kids = pageObjIds.map((id) => `${id} 0 R`).join(' ');
    objects[1] = `<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`;

    const enc = new TextEncoder();
    const parts: Uint8Array[] = [];
    const pushStr = (s: string): void => {
      parts.push(enc.encode(s));
    };

    pushStr('%PDF-1.4\n');
    let offset = 9;

    for (let i = 0; i < objects.length; i++) {
      offsets.push(offset);
      const objStr = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
      pushStr(objStr);
      offset += enc.encode(objStr).length;
    }

    const xrefOffset = offset;
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) {
      xref += `${String(off).padStart(10, '0')} 00000 n \n`;
    }
    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    xref += `startxref\n${xrefOffset}\n%%EOF`;
    pushStr(xref);

    const total = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) {
      out.set(p, pos);
      pos += p.length;
    }
    return out;
  }

  private download(data: Uint8Array, filename: string): void {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
