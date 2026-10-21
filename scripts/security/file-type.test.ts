// Testes da detecção de tipo de arquivo do upload (pela assinatura, não pelo nome).
// Rodar:  npx -y tsx --test scripts/security/file-type.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { detectFileType } from "../../src/lib/file-type";

const buf = (...bytes: number[]) => Buffer.from(bytes);

describe("detectFileType", () => {
  it("reconhece os formatos permitidos", () => {
    assert.equal(detectFileType(buf(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0))?.ext, "png");
    assert.equal(detectFileType(buf(0xff, 0xd8, 0xff, 0xe0))?.ext, "jpg");
    assert.equal(detectFileType(Buffer.from("GIF89a....", "ascii"))?.ext, "gif");
    assert.equal(detectFileType(Buffer.from("GIF87a....", "ascii"))?.ext, "gif");
    assert.equal(detectFileType(Buffer.from("%PDF-1.7\n...", "ascii"))?.mime, "application/pdf");
    assert.equal(detectFileType(Buffer.from("RIFF\0\0\0\0WEBPVP8 ", "ascii"))?.ext, "webp");
  });

  it("recusa conteúdo perigoso mesmo que o nome diga que é imagem", () => {
    assert.equal(detectFileType(Buffer.from("<html><script>alert(1)</script></html>")), null);
    assert.equal(detectFileType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>')), null);
    assert.equal(detectFileType(Buffer.from("MZ\x90\x00 executável")), null);
    assert.equal(detectFileType(Buffer.from("#!/bin/sh\nrm -rf /")), null);
    assert.equal(detectFileType(Buffer.from("PK\x03\x04 zip")), null);
  });

  it("buffers vazios ou curtos não quebram", () => {
    assert.equal(detectFileType(Buffer.alloc(0)), null);
    assert.equal(detectFileType(buf(0x89)), null);
    assert.equal(detectFileType(Buffer.from("GIF")), null);
  });
});
