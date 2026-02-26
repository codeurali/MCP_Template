#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const MAX_LINES = 400;
const ROOT_DIR = process.cwd();
const TARGET_DIRECTORIES = ["src", "tests", "scripts"];
const EXTENSIONS = [".ts", ".js"];

function shouldSkip(path) {
  const segments = path.split(/[\\/]/);
  return segments.includes("dist") || segments.includes("node_modules");
}

function walk(path, files) {
  const entries = readdirSync(path);
  for (const entry of entries) {
    const fullPath = join(path, entry);

    if (shouldSkip(fullPath)) {
      continue;
    }

    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, files);
      continue;
    }

    if (EXTENSIONS.some((extension) => fullPath.endsWith(extension))) {
      files.push(fullPath);
    }
  }
}

function countLines(path) {
  const contents = readFileSync(path, "utf8");
  if (contents.length === 0) {
    return 0;
  }

  return contents.split(/\r?\n/).length;
}

const scannedFiles = [];
for (const directory of TARGET_DIRECTORIES) {
  const fullPath = join(ROOT_DIR, directory);
  try {
    walk(fullPath, scannedFiles);
  } catch {
    // Ignore missing optional directories.
  }
}

const violations = scannedFiles
  .map((path) => ({ path, lines: countLines(path) }))
  .filter((item) => item.lines > MAX_LINES);

if (violations.length > 0) {
  console.error(`Found ${violations.length} file(s) over ${MAX_LINES} lines:`);
  for (const violation of violations) {
    console.error(`- ${violation.path}: ${violation.lines} lines`);
  }
  process.exit(1);
}

console.log(`File size check passed. ${scannedFiles.length} files scanned.`);
