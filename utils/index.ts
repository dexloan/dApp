import * as anchor from "@project-serum/anchor";
import dayjs from "dayjs";

const SECONDS_PER_YEAR = 31_536_000;
const LAMPORTS_PER_SOL = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL);

export function toMonths(seconds: number): number {
  return Math.abs(seconds / 60 / 60 / 24 / 30);
}

export function toDays(seconds: number): number {
  return Math.abs(seconds / 60 / 60 / 24);
}

export function formatDuration(duration: anchor.BN): string {
  const days = toDays(duration.toNumber());
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function hasExpired(startDate: number, duration: number): boolean {
  return Date.now() / 1000 > startDate + duration;
}

export function getFormattedDueDate(
  startDate: number,
  duration: number
): string {
  const date = dayjs.unix(startDate + duration);

  return date.format("MMM D, YYYY") + " at " + date.format("h:mm A");
}

export function formatBlockTime(blockTime: number) {
  return dayjs.unix(blockTime).format("MMM D, YYYY");
}

export function calculateInterest(
  amount: anchor.BN,
  duration: anchor.BN,
  basisPoints: number
) {
  const proRataInterestRate =
    (basisPoints / 10_000 / SECONDS_PER_YEAR) * duration.toNumber();
  return new anchor.BN(amount.toNumber() * proRataInterestRate);
}

export function yieldGenerated(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): anchor.BN {
  const now = new anchor.BN(Date.now() / 1000);
  const elapsed = now.sub(startDate);
  return calculateInterest(amount, elapsed, basisPoints);
}

export function totalAmount(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): string {
  const interestSol = yieldGenerated(amount, startDate, basisPoints);
  const amountSol = amount.div(LAMPORTS_PER_SOL);
  const totalSol = amountSol.add(interestSol);
  return totalSol.toNumber().toFixed(2).replace(/0$/, "") + "◎";
}

const amountCache = new Map<number, string>();

export function formatAmount(amount?: anchor.BN) {
  if (!amount) return null;

  if (amountCache.has(amount.toNumber())) {
    return amountCache.get(amount.toNumber());
  }

  const sol = amount.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
  const rounded = Math.round((sol + Number.EPSILON) * 100) / 100;

  let formatted;

  if (rounded < 0.001) {
    formatted = "~0.001◎";
  } else {
    formatted = rounded.toFixed(3).replace(/0{1,2}$/, "") + "◎";
  }

  amountCache.set(amount.toNumber(), formatted);

  return formatted;
}

export function formatMonths(duration?: anchor.BN) {
  return duration ? toMonths(duration.toNumber()) + " months" : null;
}

const nameMap = new Map();
nameMap.set("CHKN", "chicken_tribe");
nameMap.set("CHKCOP", "chicken_tribe_coops");
nameMap.set("XAPE", "exiled_degen_ape_academy");
nameMap.set("BH", "lgtb");

export function mapSymbolToCollectionName(symbol: string) {
  return nameMap.get(symbol.replace(/\x00/g, ""));
}

const titleMap = new Map();
titleMap.set("CHKN", "Chicken Tribe");
titleMap.set("CHKCOP", "Chicken Tribe Coops");
titleMap.set("XAPE", "Exiled Apes");
titleMap.set("BH", "Breadheads");

export function mapSymbolToCollectionTitle(symbol: string) {
  return titleMap.get(symbol.replace(/\x00/g, ""));
}
