import * as anchor from "@project-serum/anchor";

export const LISTINGS_PROGRAM_ID = new anchor.web3.PublicKey(
  "H6FCxCy2KCPJwCoUb9eQCSv41WZBKQaYfB6x5oFajzfj"
);

export const RPC_ENDPOINT = "https://devnet.genesysgo.net/"; // "https://ssc-dao.genesysgo.net/";

export const LoanState = {
  Listed: "listed",
  Active: "active",
  Defaulted: "defaulted",
  Repaid: "repaid",
  Cancelled: "cancelled",
};

export const SerializedLoanState = {
  Listed: 0,
  Active: 1,
  Defaulted: 2,
};

export const CallOptionState = {
  Listed: "listed",
  Active: "active",
  Exercised: "exercised",
  Cancelled: "cancelled",
};

export const SerializedCallOptionState = {
  Listed: 0,
  Active: 1,
  Exercised: 2,
};
