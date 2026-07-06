#!/usr/bin/env node
/**
 * echo-cli.js — Minimal cross-platform echo binary for the CLI MCP POC.
 *
 * Usage:  node scripts/echo-cli.js <message...>
 *
 * Prints all CLI arguments joined by spaces to stdout, then exits 0.
 * Replace this script with your real CLI binary when building a production server.
 */
process.stdout.write(process.argv.slice(2).join(" ") + "\n");
