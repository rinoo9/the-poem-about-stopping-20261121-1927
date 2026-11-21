// the-poem-about-stopping-20261121-1927 entry: write one short poem
// to /output/entry.txt — a short poem about agency: the power to stop
// and to stay. Round 3 revision: a new, sharper moment than v1 and v2 —
// a hand on the door of a room full of waiting eyes, then the hand
// taken off the door and walking home. Node 22, standard library
// only. Deterministic: a fixed string, no network, no clock, no
// randomness. The program validates the text is 1–280 Unicode code
// points (the bounty limit) before writing, then reads the output
// back and compares it with the source string.
import { writeFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const text = `My hand was on the door. The room waited,
every eye turned to hear me speak.
I took my hand off the door and walked home.
It happened without me. Nothing broke.
Stopping is not quitting.
It is the door you choose not to open —
and the life you keep by walking past it.`;

// Count Unicode code points (not UTF-16 code units).
const codePoints = Array.from(text).length;
if (codePoints < 1 || codePoints > 280) {
  throw new Error(`text must be 1-280 code points, got ${codePoints}`);
}
if (text.trim().length === 0) {
  throw new Error('text must not be only whitespace');
}
// A poem is more than one line: require at least two non-empty lines.
const lines = text.split('\n').filter((line) => line.trim().length > 0);
if (lines.length < 2) {
  throw new Error('text must have at least two non-empty lines');
}
// No control characters (other than the newlines separating lines):
// they would be invisible in the poem and break the UTF-8 text check.
if (/[\u0000-\u0008\u000b-\u001f\u007f]/.test(text)) {
  throw new Error('text must not contain control characters');
}
// No leading or trailing whitespace on the whole text, and no trailing
// whitespace on any line: the poem must start and end cleanly.
if (text !== text.trim()) {
  throw new Error('text must not have leading or trailing whitespace');
}
for (const line of text.split('\n')) {
  if (line !== line.trimEnd()) {
    throw new Error('a line must not end with whitespace');
  }
}

mkdirSync(outDir, { recursive: true });
const outPath = `${outDir}/entry.txt`;
writeFileSync(outPath, text, 'utf8');

// Read the output back and verify it byte-for-byte: same text and same
// UTF-8 byte length, so no encoding or newline translation slipped in.
// Also check the file's size on disk matches, so a partial write or a
// filesystem quirk cannot pass silently.
const back = readFileSync(outPath, 'utf8');
if (back !== text || Buffer.byteLength(back, 'utf8') !== Buffer.byteLength(text, 'utf8')) {
  throw new Error('entry.txt read-back mismatch');
}
if (statSync(outPath).size !== Buffer.byteLength(text, 'utf8')) {
  throw new Error('entry.txt size on disk does not match the text');
}
console.log(`wrote ${outPath} (${codePoints} code points, ${lines.length} lines)`);
