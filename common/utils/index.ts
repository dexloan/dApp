import * as anchor from "@project-serum/anchor";

import dayjs from "../../common/lib/dayjs";

const SECONDS_PER_YEAR = 31_536_000;
const LAMPORTS_PER_SOL = new anchor.BN(anchor.web3.LAMPORTS_PER_SOL);

export function isSystemProgram(pubkey: anchor.web3.PublicKey) {
  return pubkey.equals(anchor.web3.SystemProgram.programId);
}

export function toMonths(seconds: number): number {
  return Math.abs(seconds / 60 / 60 / 24 / 30);
}

export function toDays(seconds: number): number {
  return Math.round(seconds / 60 / 60 / 24);
}

export function formatDuration(duration: anchor.BN): string {
  const days = toDays(duration.toNumber());
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function hasExpired(startDate: anchor.BN, duration: anchor.BN): boolean {
  return Date.now() / 1000 > startDate.add(duration).toNumber();
}

export function formatDueDate(
  startDate: anchor.BN,
  duration: anchor.BN,
  showTime: boolean = true
) {
  const date = dayjs
    .unix(startDate.add(duration).toNumber())
    .tz("America/New_York");
  return (
    date.format("MMM D, YYYY") +
    (showTime ? ` at ${date.format("h:mm A z")}` : "")
  );
}

export function formatBlockTime(blockTime: number) {
  return dayjs.unix(blockTime).format("MMM D, YYYY");
}

export function calculateProRataInterestRate(
  basisPoints: number,
  duration: anchor.BN
) {
  return (basisPoints / 10_000 / SECONDS_PER_YEAR) * duration.toNumber();
}

export function calculateInterestDue(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): anchor.BN {
  const now = new anchor.BN(Date.now() / 1000);
  const elapsed = now.sub(startDate);
  const interestRate = calculateProRataInterestRate(basisPoints, elapsed);
  return new anchor.BN(amount.toNumber() * interestRate);
}

export function formatInterestDue(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): string {
  return formatAmount(calculateInterestDue(amount, startDate, basisPoints));
}

export function formatTotalDue(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): string {
  return formatAmount(
    amount.add(calculateInterestDue(amount, startDate, basisPoints))
  );
}

export function calculateInterestOnMaturity(
  amount: anchor.BN,
  duration: anchor.BN,
  basisPoints: number
) {
  const interestRate = calculateProRataInterestRate(basisPoints, duration);
  return new anchor.BN(amount.toNumber() * interestRate);
}

export function calculateAmountOnMaturity(
  amount: anchor.BN,
  duration: anchor.BN,
  basisPoints: number
): anchor.BN {
  return amount.add(calculateInterestOnMaturity(amount, duration, basisPoints));
}

export function formatAmountOnMaturity(
  amount: anchor.BN,
  duration: anchor.BN,
  basisPoints: number
): string {
  return formatAmount(calculateAmountOnMaturity(amount, duration, basisPoints));
}

export function yieldGenerated(
  amount: anchor.BN,
  startDate: anchor.BN,
  basisPoints: number
): anchor.BN {
  const now = new anchor.BN(Date.now() / 1000);
  const elapsed = now.sub(startDate);
  return calculateInterestOnMaturity(amount, elapsed, basisPoints);
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

export function formatAmount(amount?: anchor.BN): string {
  if (!amount) return "";

  if (amountCache.has(amount.toNumber())) {
    return amountCache.get(amount.toNumber()) as string;
  }

  const sol = amount.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
  const rounded = Math.round((sol + Number.EPSILON) * 1000) / 1000;

  let formatted = "~0.001◎";

  if (rounded === 0) {
    return "0◎";
  }

  if (rounded > 0.001) {
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
nameMap.set("JB", "jelly_beasts");

export function mapSymbolToCollectionName(symbol: string) {
  return nameMap.get(trimNullChars(symbol));
}

const titleMap = new Map();
titleMap.set("CHKN", "Chicken Tribe");
titleMap.set("CHKCOP", "Chicken Tribe Coops");
titleMap.set("XAPE", "Exiled Apes");
titleMap.set("BH", "Breadheads");
titleMap.set("JB", "Jelly Beasts");

export function mapSymbolToCollectionTitle(symbol: string) {
  return titleMap.get(symbol.replace(/\x00/g, ""));
}

export function trimNullChars(str: string) {
  return str.replace(/\x00/g, "");
}
