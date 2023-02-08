import type { LoanState, CallOptionState } from "@prisma/client";
import camelcase from "camelcase";

import type { LoanData, CallOptionData } from "../types";
import * as utils from "../utils";

export function getState<T>(state: unknown) {
  let formattedState;

  if (typeof state === "object" && state !== null) {
    formattedState = camelcase(Object.keys(state)[0], {
      pascalCase: true,
    }) as T;
  }

  return formattedState;
}

export function mapLoanEntry(data: LoanData) {
  const state = getState<LoanState>(data.state);

  if (state === undefined) {
    throw new Error("state not found");
  }

  return {
    state,
    amount: data.amount ? utils.toBigInt(data.amount) : undefined,
    basisPoints: data.basisPoints,
    creatorBasisPoints: data.creatorBasisPoints,
    outstanding: utils.toBigInt(data.outstanding),
    threshold: data.threshold,
    borrower: data.borrower.toBase58(),
    lender: data.lender?.toBase58(),
    installments: data.installments,
    currentInstallment: data.currentInstallment,
    noticeIssued: data.noticeIssued
      ? utils.toBigInt(data.noticeIssued)
      : undefined,
    duration: utils.toBigInt(data.duration),
    startDate: data.startDate ? utils.toBigInt(data.startDate) : undefined,
    mint: data.mint.toBase58(),
    tokenMint: data.tokenMint?.toBase58(),
  };
}

export function mapCallOptionEntry(data: CallOptionData) {
  const state = getState<CallOptionState>(data.state);

  if (state === undefined) {
    throw new Error("state not found");
  }

  return {
    state,
    amount: utils.toBigInt(data.amount),
    creatorBasisPoints: data.creatorBasisPoints,
    seller: data.seller?.toBase58(),
    buyer: data.buyer?.toBase58(),
    expiry: utils.toBigInt(data.expiry),
    strikePrice: utils.toBigInt(data.strikePrice),
    mint: data.mint.toBase58(),
    tokenMint: data.tokenMint?.toBase58(),
  };
}
