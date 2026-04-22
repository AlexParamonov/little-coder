import { describe, it, expect } from "vitest";

// Exercise the char→token conversion (matches local/context_manager.py)
function charsToTokens(chars: number): number {
  return Math.ceil(chars / 3.5);
}

describe("thinking budget token estimation", () => {
  it("converts chars to tokens via /3.5", () => {
    expect(charsToTokens(0)).toBe(0);
    expect(charsToTokens(3)).toBe(1);
    expect(charsToTokens(7)).toBe(2);
    expect(charsToTokens(3500)).toBe(1000);
  });
  it("2048 tokens ~ 7168 chars", () => {
    // Budget trigger boundary: ceil(7169/3.5) = 2049 > 2048
    expect(charsToTokens(7168)).toBe(2048);
    expect(charsToTokens(7169)).toBeGreaterThan(2048);
  });
});
