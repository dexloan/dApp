import * as anchor from "@project-serum/anchor";

import dayjs from "../../common/lib/dayjs";

const SECONDS_PER_YEAR = 31_536_000;
const LATE_REPAYMENT_FEE_BASIS_POINTS = 500;

export function isSystemProgram(pubkey: anchor.web3.PublicKey) {
  return pubkey.equals(anchor.web3.SystemProgram.programId);
}

export function toMonths(seconds: number): number {
  return Math.abs(seconds / 60 / 60 / 24 / 30);
}

export function toDays(seconds: number): number {
  return Math.round(seconds / 60 / 60 / 24);
}

export function formatHexDuration(duration: string): string {
  const days = toDays(hexToNumber(duration));
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function formatHexTimestamp(
  ts: string,
  showTime: boolean = false
): string {
  const date = dayjs.unix(hexToNumber(ts)).tz("America/New_York");

  return (
    date.format("MMM D, YYYY") +
    (showTime ? ` at ${date.format("h:mm A z")}` : "")
  );
}

export function formatDuration(duration: number): string {
  const dur = dayjs.duration(duration, "seconds");
  return dur.humanize();
}

export function formatBasisPoints(basisPoints: number): string {
  let percent = 0;

  if (basisPoints !== 0) {
    percent = basisPoints / 100;
  }

  return percent + "%";
}

export function formatBlockTime(blockTime: number) {
  return dayjs.unix(blockTime).format("MMM D, YYYY");
}

export function calculateFeeFromBasisPoints(
  amount: bigint,
  basisPoints: number
) {
  return (BigInt(basisPoints) * amount) / BigInt(10_000);
}

/*
 * Calculates the interest due on a loan.
 **/
export function calculateLoanRepaymentFee(
  amount: bigint,
  basisPoints: number,
  duration: bigint,
  isOverdue: boolean = false
): bigint {
  const annualInterest = calculateFeeFromBasisPoints(amount, basisPoints);
  let interestDue = (annualInterest * duration) / BigInt(SECONDS_PER_YEAR);

  if (isOverdue) {
    interestDue =
      interestDue +
      calculateFeeFromBasisPoints(amount, LATE_REPAYMENT_FEE_BASIS_POINTS);
  }

  return interestDue;
}

/*
 * Calculates the interest currently due on a loan.
 **/
export function calculateInterestDue(
  amount: bigint,
  startDate: bigint,
  basisPoints: number,
  expired: boolean
): bigint {
  const now = Math.round(Date.now() / 1000);
  const elapsed = BigInt(now) / startDate;

  return calculateLoanRepaymentFee(amount, basisPoints, elapsed, expired);
}

/*
 * Calculates the total amount repayable on loan maturity.
 **/
export function calculateAmountOnMaturity(
  amount: bigint,
  duration: bigint,
  basisPoints: number
): bigint {
  return amount + calculateLoanRepaymentFee(amount, basisPoints, duration);
}

/*
 * Calculates the total amount repayable now.
 **/
export function formatTotalDue(
  amount: bigint,
  startDate: bigint,
  basisPoints: number,
  expired: boolean
): string {
  const total =
    amount + calculateInterestDue(amount, startDate, basisPoints, expired);

  return formatAmount(total);
}

/*
 * Gets the due date of a loan
 * @returns {dayjs} - The due date of the loan
 **/
export function getDueDate(startDate: bigint, duration: bigint) {
  return dayjs.unix(Number(startDate + duration)).tz("America/New_York");
}

export function basisPointsToPercent(basisPoints: number) {
  return (basisPoints / 100).toFixed(2) + "%";
}

export function hexToNumber(hex: string) {
  return Number(BigInt(hex).toString());
}

const hexAmountCache = new Map<string, string>();

export function formatHexAmount(amount?: string): string {
  if (!amount) return "";

  if (hexAmountCache.has(amount)) {
    return hexAmountCache.get(amount) as string;
  }

  const number = hexToNumber(amount);

  if (number === 0 || isNaN(number)) {
    return "0◎";
  }

  const sol = number / anchor.web3.LAMPORTS_PER_SOL;
  const rounded = Math.round((sol + Number.EPSILON) * 1000) / 1000;

  let formatted = "~0.001◎";

  if (rounded > 0.001) {
    formatted = rounded.toFixed(3).replace(/0{1,2}$/, "") + "◎";
  }

  hexAmountCache.set(amount, formatted);

  return formatted;
}

const amountCache = new Map<string, string>();

export function formatAmount(amount?: bigint): string {
  if (!amount) return "";

  if (amountCache.has(amount.toString())) {
    return amountCache.get(amount.toString()) as string;
  }

  if (amount === BigInt(0)) {
    return "0◎";
  }

  const sol = Number(amount) / anchor.web3.LAMPORTS_PER_SOL;
  const rounded = Math.round((sol + Number.EPSILON) * 1000) / 1000;

  let formatted = "~0.001◎";

  if (rounded > 0.001) {
    formatted = rounded.toFixed(3).replace(/0{1,2}$/, "") + "◎";
  }

  amountCache.set(amount.toString(), formatted);

  return formatted;
}

export function formatMonths(duration?: anchor.BN) {
  return duration ? toMonths(duration.toNumber()) + " months" : null;
}

export function trimNullChars(str: string) {
  return str.replace(/\x00/g, "");
}

export async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function notNull<T>(value: T | null): value is NonNullable<T> {
  return value != null;
}

export function toHexString(value: bigint | number): string {
  return "0x" + value.toString(16);
}

export function parseBigInts(result: any) {
  return JSON.parse(
    JSON.stringify(result, (key, value) =>
      typeof value === "bigint" ? "0x" + value.toString(16) : value
    )
  );
}

export function toBigInt(value: anchor.BN): bigint {
  return BigInt("0x" + value.toString("hex"));
}

export async function asyncRetry<T>(cb: () => Promise<T>) {
  const retry = async (num: number): Promise<T> => {
    console.log("retry: ", num);
    try {
      const result = await cb();
      return result;
    } catch (err) {
      console.log("retry error: ", err);
      if (num > 5) {
        throw err;
      }
      await wait(1000);
      return retry(num + 1);
    }
  };

  return retry(0);
}
