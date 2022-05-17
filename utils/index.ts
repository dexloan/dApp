import * as anchor from "@project-serum/anchor";
import dayjs from "dayjs";

const SECONDS_PER_YEAR = 31_536_000;

export function toMonths(seconds: number = 0): number {
  return Math.abs(seconds / 60 / 60 / 24 / 30);
}

export function hasExpired(startDate: number, duration: number): boolean {
  return Date.now() / 1000 > startDate + duration;
}

export function getFormattedDueDate(
  startDate: number,
  duration: number
): string {
  console.log("startDate", startDate);
  console.log("duration", duration);
  const date = dayjs.unix(startDate + duration);

  return date.format("MMM D, YYYY") + " at " + date.format("h:mm A");
}

export function formatBlockTime(blockTime: number) {
  return dayjs.unix(blockTime).format("MMM D, YYYY");
}

export function yieldGenerated(
  amount: number,
  startDate: number,
  basisPoints: number
): number {
  const now = Date.now() / 1000;
  const elapsed = now - startDate;
  const proRataInterestRate =
    (basisPoints / 10_000 / SECONDS_PER_YEAR) * elapsed;
  return Math.max(
    0,
    (amount * proRataInterestRate) / anchor.web3.LAMPORTS_PER_SOL
  );
}

export function totalAmount(
  amount: number,
  startDate: number,
  basisPoints: number
): string {
  const interestSol = yieldGenerated(amount, startDate, basisPoints);
  const amountSol = amount / anchor.web3.LAMPORTS_PER_SOL;
  const totalSol = amountSol + interestSol;
  const rounded = Math.round((totalSol + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2).replace(/0$/, "") + "◎";
}

export function formatAmount(amount?: anchor.BN, precision?: number) {
  if (!amount) return null;

  const sol = amount.toNumber() / anchor.web3.LAMPORTS_PER_SOL;
  const rounded = Math.round((sol + Number.EPSILON) * 100) / 100;
  return rounded.toFixed(2).replace(/0$/, "") + "◎";
}

export function formatMonths(duration?: anchor.BN) {
  return duration ? toMonths(duration.toNumber()) + " months" : null;
}

const nameMap = new Map();
nameMap.set("CHKN", "chicken_tribe");
nameMap.set("XAPE", "exiled_degen_ape_academy");
nameMap.set("BH", "lgtb");

export function mapSymbolToCollectionName(symbol: string) {
  return titleMap.get(symbol.replace(/\x00/g, ""));
}

const titleMap = new Map();
titleMap.set("CHKN", "Chicken Tribe");
titleMap.set("XAPE", "Exiled Apes");
titleMap.set("BH", "Breadheads");

export function mapSymbolToCollectionTitle(symbol: string) {
  return titleMap.get(symbol.replace(/\x00/g, ""));
}
