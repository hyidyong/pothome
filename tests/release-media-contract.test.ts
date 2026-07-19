import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const workspaceRoot = process.cwd();
const sourcePath = join(
  workspaceRoot,
  ".superpowers",
  "brainstorm",
  "173-1784464204",
  "content",
  "hero-strategy-signal.png",
);
const fingerprint = createHash("sha256")
  .update(readFileSync(sourcePath))
  .digest("hex")
  .slice(0, 8);
const publicImageStem = join(
  workspaceRoot,
  "public",
  "images",
  `hero-strategy-signal-${fingerprint}`,
);

function readThreeByteLittleEndian(buffer: Buffer, offset: number) {
  return (
    buffer[offset]! + (buffer[offset + 1]! << 8) + (buffer[offset + 2]! << 16)
  );
}

function readWebpDimensions(buffer: Buffer) {
  const chunk = buffer.toString("ascii", 12, 16);

  if (chunk === "VP8X") {
    return {
      width: 1 + readThreeByteLittleEndian(buffer, 24),
      height: 1 + readThreeByteLittleEndian(buffer, 27),
    };
  }

  if (chunk === "VP8 ") {
    return {
      width: buffer.readUInt16LE(26) & 0x3fff,
      height: buffer.readUInt16LE(28) & 0x3fff,
    };
  }

  if (chunk === "VP8L") {
    const packed = buffer.readUInt32LE(21);
    return {
      width: 1 + (packed & 0x3fff),
      height: 1 + ((packed >> 14) & 0x3fff),
    };
  }

  throw new Error(`Unsupported WebP chunk: ${chunk}`);
}

function readAvifDimensions(buffer: Buffer) {
  const ispe = buffer.indexOf(Buffer.from("ispe", "ascii"));
  if (ispe < 0) {
    throw new Error("AVIF is missing its ispe dimensions box");
  }

  return {
    width: buffer.readUInt32BE(ispe + 8),
    height: buffer.readUInt32BE(ispe + 12),
  };
}

describe("release Hero media", () => {
  it("uses the approved source fingerprint in both optimized file names", () => {
    expect(fingerprint).toBe("f48ea2a6");

    for (const extension of ["avif", "webp"]) {
      expect(() => statSync(`${publicImageStem}.${extension}`)).not.toThrow();
    }
  });

  it("delivers valid AVIF and WebP files at the approved dimensions under 300KB", () => {
    const avif = readFileSync(`${publicImageStem}.avif`);
    const webp = readFileSync(`${publicImageStem}.webp`);

    expect(avif.toString("ascii", 4, 8)).toBe("ftyp");
    expect(avif.toString("ascii", 8, 32)).toContain("avif");
    expect(readAvifDimensions(avif)).toEqual({ width: 1672, height: 941 });

    expect(webp.toString("ascii", 0, 4)).toBe("RIFF");
    expect(webp.toString("ascii", 8, 12)).toBe("WEBP");
    expect(readWebpDimensions(webp)).toEqual({ width: 1672, height: 941 });

    expect(avif.byteLength).toBeLessThan(300 * 1024);
    expect(webp.byteLength).toBeLessThan(300 * 1024);
  });

  it("preloads the reserved, responsive Hero image without a color wash", () => {
    const component = readFileSync(
      join(workspaceRoot, "src", "components", "portfolio", "hero-section.tsx"),
      "utf8",
    );
    const styles = readFileSync(
      join(workspaceRoot, "src", "app", "globals.css"),
      "utf8",
    );
    const nextConfig = readFileSync(
      join(workspaceRoot, "next.config.ts"),
      "utf8",
    );

    expect(component).toContain(
      'imageSrc = "/images/hero-strategy-signal-f48ea2a6.avif"',
    );
    expect(component).toContain("preload");
    expect(component).toContain('sizes="(max-width: 900px) 100vw, 48vw"');
    expect(component).toContain(
      "문서, 시장 지도와 의사결정 노드가 하나의 실행 방향으로 수렴하는 추상 전략 이미지",
    );
    expect(styles).toMatch(
      /\.hero-section__visual\s*\{[\s\S]*?aspect-ratio:\s*1672\s*\/\s*941/,
    );
    expect(styles).toMatch(
      /\.hero-section__visual\s*\{[\s\S]*?width:\s*100%[\s\S]*?height:\s*100%/,
    );
    expect(styles).toMatch(
      /\.hero-section__image\s*\{[\s\S]*?object-position:\s*78%\s+50%/,
    );
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.hero-section__image\s*\{[\s\S]*?object-position:\s*74%\s+50%/,
    );
    expect(styles).toMatch(
      /@media\s*\(max-width:\s*900px\)[\s\S]*?\.hero-section__visual\s*\{[\s\S]*?height:\s*auto/,
    );
    expect(styles).not.toMatch(
      /\.hero-section__visual(?:::\w+)?\s*\{[^}]*background:\s*(?:linear|radial)-gradient/,
    );
    expect(nextConfig).toContain('formats: ["image/avif", "image/webp"]');
  });
});
