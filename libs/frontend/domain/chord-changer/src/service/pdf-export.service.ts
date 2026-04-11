import { Injectable } from '@angular/core';

// Hand-crafted PDF with a custom 8-bit encoding that covers:
//   • ASCII (0x20–0x7E) — unchanged
//   • Latin-1 Supplement (U+00A0–U+00FF) at bytes 0xA0–0xFF
//     → Spanish, French, German, Italian, Portuguese, Romanian…
//   • Latin Extended-A common chars at bytes 0x80–0x9F
//     → Croatian (ć č đ š ž), Polish (ą ę ł ń ś ź ż),
//       Czech/Slovak (ě ř ů), Hungarian (ő Ő)
//
// No external font required — glyphs come from the viewer's Courier.
@Injectable({ providedIn: 'root' })
export class PdfExportService {
  private readonly PAGE_W = 595;
  private readonly PAGE_H = 842;
  private readonly MARGIN = 56;
  private readonly FONT_SIZE = 10;
  private readonly LINE_H = 14;
  private readonly CHAR_W = 0.6 * 10;

  // ── Encoding table ──────────────────────────────────────────────────────
  // Maps Unicode codepoint → single PDF encoding byte (0x80–0x9F).
  // Latin-1 Supplement (U+00A0–U+00FF) maps identity → 0xA0–0xFF (handled
  // in encodeLineBytes without an explicit map entry).
  private readonly UNICODE_TO_BYTE = new Map<number, number>([
    // Croatian
    [0x0107, 0x80], // ć
    [0x0106, 0x81], // Ć
    [0x010d, 0x82], // č
    [0x010c, 0x83], // Č
    [0x0111, 0x84], // đ
    [0x0110, 0x85], // Đ
    [0x0161, 0x86], // š
    [0x0160, 0x87], // Š
    [0x017e, 0x88], // ž
    [0x017d, 0x89], // Ž
    // Polish
    [0x0105, 0x8a], // ą
    [0x0104, 0x8b], // Ą
    [0x0119, 0x8c], // ę
    [0x0118, 0x8d], // Ę
    [0x0142, 0x8e], // ł
    [0x0141, 0x8f], // Ł
    [0x0144, 0x90], // ń
    [0x0143, 0x91], // Ń
    [0x015b, 0x92], // ś
    [0x015a, 0x93], // Ś
    [0x017a, 0x94], // ź
    [0x0179, 0x95], // Ź
    [0x017c, 0x96], // ż
    [0x017b, 0x97], // Ż
    // Czech / Slovak
    [0x011b, 0x98], // ě
    [0x011a, 0x99], // Ě
    [0x0159, 0x9a], // ř
    [0x0158, 0x9b], // Ř
    [0x016f, 0x9c], // ů
    [0x016e, 0x9d], // Ů
    // Hungarian (extra vowels beyond Latin-1)
    [0x0151, 0x9e], // ő
    [0x0150, 0x9f], // Ő
  ]);

  // Matching glyph names for the /Differences array (bytes 0x80–0x9F then 0xA0–0xFF).
  private readonly DIFFERENCES_0x80 = [
    'cacute', 'Cacute', 'ccaron', 'Ccaron', 'dcroat', 'Dcroat',
    'scaron', 'Scaron', 'zcaron', 'Zcaron',
    'aogonek', 'Aogonek', 'eogonek', 'Eogonek',
    'lslash', 'Lslash',
    'nacute', 'Nacute',
    'sacute', 'Sacute',
    'zacute', 'Zacute',
    'zdotaccent', 'Zdotaccent',
    'ecaron', 'Ecaron',
    'rcaron', 'Rcaron',
    'uring', 'Uring',
    'ohungarumlaut', 'Ohungarumlaut',
  ] as const;

  // Latin-1 Supplement glyph names for bytes 0xA0–0xFF (Adobe Glyph List).
  private readonly DIFFERENCES_0xA0 = [
    'nbspace', 'exclamdown', 'cent', 'sterling', 'currency', 'yen',
    'brokenbar', 'section', 'dieresis', 'copyright', 'ordfeminine',
    'guillemotleft', 'logicalnot', 'softhyphen', 'registered', 'macron',
    'degree', 'plusminus', 'twosuperior', 'threesuperior', 'acute', 'mu',
    'paragraph', 'periodcentered', 'cedilla', 'onesuperior', 'ordmasculine',
    'guillemotright', 'onequarter', 'onehalf', 'threequarters', 'questiondown',
    'Agrave', 'Aacute', 'Acircumflex', 'Atilde', 'Adieresis', 'Aring',
    'AE', 'Ccedilla', 'Egrave', 'Eacute', 'Ecircumflex', 'Edieresis',
    'Igrave', 'Iacute', 'Icircumflex', 'Idieresis', 'Eth', 'Ntilde',
    'Ograve', 'Oacute', 'Ocircumflex', 'Otilde', 'Odieresis', 'multiply',
    'Oslash', 'Ugrave', 'Uacute', 'Ucircumflex', 'Udieresis', 'Yacute',
    'Thorn', 'germandbls',
    'agrave', 'aacute', 'acircumflex', 'atilde', 'adieresis', 'aring',
    'ae', 'ccedilla', 'egrave', 'eacute', 'ecircumflex', 'edieresis',
    'igrave', 'iacute', 'icircumflex', 'idieresis', 'eth', 'ntilde',
    'ograve', 'oacute', 'ocircumflex', 'otilde', 'odieresis', 'divide',
    'oslash', 'ugrave', 'uacute', 'ucircumflex', 'udieresis', 'yacute',
    'thorn', 'ydieresis',
  ] as const;

  // ── Public API ──────────────────────────────────────────────────────────
  public exportText(text: string, filename = 'song_chords.pdf'): void {
    const usableW = this.PAGE_W - this.MARGIN * 2;
    const usableH = this.PAGE_H - this.MARGIN * 2;
    const charsPerLine = Math.floor(usableW / this.CHAR_W);
    const linesPerPage = Math.floor(usableH / this.LINE_H);

    const wrappedLines = this.wrapLines(text.split('\n'), charsPerLine);
    const pages = this.paginate(wrappedLines, linesPerPage);

    this.download(this.buildPdf(pages), filename);
  }

  // ── Text helpers ────────────────────────────────────────────────────────
  private wrapLines(lines: string[], maxChars: number): string[] {
    const result: string[] = [];
    for (const line of lines) {
      if (line.length === 0) { result.push(''); continue; }
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

  /** Convert a line of Unicode text to encoding bytes. */
  private encodeLineBytes(line: string): Uint8Array {
    const bytes: number[] = [];
    for (const ch of line) {
      const code = ch.codePointAt(0) ?? 0x3f;
      if (code < 0x80) {
        bytes.push(code);
      } else if (code >= 0xa0 && code <= 0xff) {
        // Latin-1 Supplement: identity mapping to 0xA0–0xFF
        bytes.push(code);
      } else {
        const mapped = this.UNICODE_TO_BYTE.get(code);
        bytes.push(mapped ?? 0x3f); // '?' for unsupported chars
      }
    }
    return new Uint8Array(bytes);
  }

  /** Escape a raw byte sequence for use inside a PDF string literal ( … ). */
  private escapePdfBytes(raw: Uint8Array): string {
    let s = '';
    for (const b of raw) {
      if (b === 0x00) s += '\\000';       // null byte — skip/neutralise
      else if (b === 0x5c) s += '\\\\';
      else if (b === 0x28) s += '\\(';
      else if (b === 0x29) s += '\\)';
      else s += String.fromCharCode(b);
    }
    return s;
  }

  /**
   * Encode a string as a Latin-1 byte array.
   * Uses charCode instead of TextEncoder to avoid UTF-8 multibyte sequences.
   */
  private latin1Bytes(s: string): Uint8Array {
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i) & 0xff;
    return bytes;
  }

  // ── PDF builder ─────────────────────────────────────────────────────────
  private buildPdf(pages: string[][]): Uint8Array {
    const objects: string[] = [];
    const offsets: number[] = [];
    const push = (obj: string): number => { objects.push(obj); return objects.length; };

    push(''); // 1: Catalog
    push(''); // 2: Pages

    // Content streams
    const contentIds: number[] = [];
    const contentStreams: Uint8Array[] = [];

    for (const lines of pages) {
      let s = 'BT\n';
      s += `/F1 ${this.FONT_SIZE} Tf\n`;
      s += `${this.MARGIN} ${this.PAGE_H - this.MARGIN - this.FONT_SIZE} Td\n`;
      s += `${this.LINE_H} TL\n`;
      for (const line of lines) {
        const escaped = this.escapePdfBytes(this.encodeLineBytes(line));
        s += `(${escaped}) Tj T*\n`;
      }
      s += 'ET';

      const streamBytes = this.latin1Bytes(s);
      contentStreams.push(streamBytes);
      contentIds.push(push(`<< /Length ${streamBytes.length} >>`));
    }

    // Page objects
    const fontObjId = objects.length + 1 + pages.length;
    const pageObjIds: number[] = [];
    for (let i = 0; i < pages.length; i++) {
      pageObjIds.push(push(
        `<< /Type /Page /Parent 2 0 R ` +
        `/MediaBox [0 0 ${this.PAGE_W} ${this.PAGE_H}] ` +
        `/Contents ${contentIds[i]} 0 R ` +
        `/Resources << /Font << /F1 ${fontObjId} 0 R >> >> >>`
      ));
    }

    // Font object with custom encoding
    const diffs0x80 = this.DIFFERENCES_0x80.map(n => `/${n}`).join(' ');
    const diffs0xa0 = this.DIFFERENCES_0xA0.map(n => `/${n}`).join(' ');
    push(
      `<< /Type /Font /Subtype /Type1 /BaseFont /Courier ` +
      `/Encoding << /Type /Encoding ` +
      `/Differences [128 ${diffs0x80} 160 ${diffs0xa0}] >> >>`
    );

    objects[0] = '<< /Type /Catalog /Pages 2 0 R >>';
    objects[1] = `<< /Type /Pages /Kids [${pageObjIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`;

    // Assemble bytes
    const ascii = (str: string): Uint8Array => new TextEncoder().encode(str);
    const parts: Uint8Array[] = [ascii('%PDF-1.4\n')];
    let offset = 9;
    let streamIdx = 0;

    for (let i = 0; i < objects.length; i++) {
      offsets.push(offset);
      const header = `${i + 1} 0 obj\n${objects[i]}\n`;
      const isContent = i >= 2 && i < 2 + pages.length;

      if (isContent) {
        const body = contentStreams[streamIdx++];
        const pre = ascii(`${header}stream\n`);
        const post = ascii(`\nendstream\nendobj\n`);
        parts.push(pre, body, post);
        offset += pre.length + body.length + post.length;
      } else {
        const full = ascii(`${header}endobj\n`);
        parts.push(full);
        offset += full.length;
      }
    }

    // xref + trailer
    let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (const off of offsets) xref += `${String(off).padStart(10, '0')} 00000 n \n`;
    xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF`;
    parts.push(ascii(xref));

    const total = parts.reduce((s, p) => s + p.length, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    for (const p of parts) { out.set(p, pos); pos += p.length; }
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
