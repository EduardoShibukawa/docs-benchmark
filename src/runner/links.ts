import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

export interface LinkAuditResult {
  totalLinks: number;
  validLinks: number;
  brokenLinks: Array<{ source: string; target: string; reason: string }>;
  brokenLocatorRate: number; // 0 to 100%
}

/**
 * Recursively scans HTML / Markdown files and audits all internal links and locators.
 */
export function auditDocumentationLinks(docRootDir: string): LinkAuditResult {
  const root = resolve(docRootDir);
  const allFiles = listFilesRecursive(root);

  let totalLinks = 0;
  const brokenLinks: Array<{ source: string; target: string; reason: string }> = [];

  const anchorRegistry = new Map<string, Set<string>>();

  // Pass 1: Build anchor registry for each HTML file
  for (const file of allFiles) {
    if (!file.endsWith(".html")) continue;
    const content = readFileSync(file, "utf8");
    const anchors = new Set<string>();

    const idRegex = /(?:id|name)=["']([^"']+)["']/g;
    let m: RegExpExecArray | null;
    while ((m = idRegex.exec(content)) !== null) {
      anchors.add(m[1]);
    }
    anchorRegistry.set(file, anchors);
  }

  // Pass 2: Verify hrefs
  const linkRegex = /href=["']([^"'#]+)?(?:#([^"']*))?["']/g;
  for (const file of allFiles) {
    if (!file.endsWith(".html") && !file.endsWith(".md")) continue;
    const content = readFileSync(file, "utf8");

    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(content)) !== null) {
      const rawPath = match[1];
      const anchor = match[2];

      if (!rawPath && !anchor) continue;
      // Skip external links and mailto/javascript
      if (rawPath && (rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("mailto:") || rawPath.startsWith("javascript:"))) {
        continue;
      }

      totalLinks++;

      // Check local file existence
      let targetFile = file;
      if (rawPath) {
        if (rawPath.startsWith("/")) {
          targetFile = join(root, rawPath.replace(/^\//, ""));
        } else {
          targetFile = resolve(join(file, "..", rawPath));
        }
      }

      if (!existsSync(targetFile)) {
        brokenLinks.push({
          source: file.replace(root + "/", ""),
          target: rawPath || "#" + anchor,
          reason: `Target file not found: ${targetFile}`,
        });
        continue;
      }

      // Check anchor if present
      if (anchor && targetFile.endsWith(".html")) {
        const fileAnchors = anchorRegistry.get(targetFile);
        if (fileAnchors && !fileAnchors.has(anchor)) {
          brokenLinks.push({
            source: file.replace(root + "/", ""),
            target: `${rawPath || ""}#${anchor}`,
            reason: `Anchor #${anchor} not found in ${targetFile}`,
          });
        }
      }
    }
  }

  const validLinks = totalLinks - brokenLinks.length;
  const brokenLocatorRate = totalLinks > 0 ? Math.round((brokenLinks.length / totalLinks) * 1000) / 10 : 0;

  return {
    totalLinks,
    validLinks,
    brokenLinks,
    brokenLocatorRate,
  };
}

function listFilesRecursive(dir: string): string[] {
  let results: string[] = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) {
      results = results.concat(listFilesRecursive(full));
    } else {
      results.push(full);
    }
  }
  return results;
}
