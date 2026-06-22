import { LexoRank } from "lexorank";

export function getRankBetween(prevRank?: string | null, nextRank?: string | null): string {
  console.log(`[getRankBetween] Called with prevRank: ${prevRank}, nextRank: ${nextRank}`);
  try {
    const prev = prevRank ? LexoRank.parse(prevRank) : null;
    const next = nextRank ? LexoRank.parse(nextRank) : null;

    if (!prev && !next) {
      return LexoRank.middle().toString();
    }
    if (!prev && next) {
      return next.genPrev().toString();
    }
    if (!next && prev) {
      return prev.genNext().toString();
    }
    
    if (prevRank === nextRank || prev!.compareTo(next!) === 0) {
      return prev!.genNext().toString();
    }
    if (prev!.compareTo(next!) > 0) {
      return next!.between(prev!).toString();
    }
    return prev!.between(next!).toString();
  } catch (err) {
    console.error("LexoRank generation error:", err, { prevRank, nextRank });
    // If it fails, fallback to generating a rank based on timestamp to avoid duplicate rank clashes
    const randomSuffix = Math.floor(Math.random() * 1000).toString(16);
    return LexoRank.middle().toString() + randomSuffix; // Not valid lexorank, but prevents same-rank collision temporarily
  }
}
