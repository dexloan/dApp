import * as anchor from "@project-serum/anchor";

export const LISTINGS_PROGRAM_ID = new anchor.web3.PublicKey(
  "H6FCxCy2KCPJwCoUb9eQCSv41WZBKQaYfB6x5oFajzfj"
);

export const RPC_ENDPOINT = "https://ssc-dao.genesysgo.net/";

export const SECONDS_PER_DAY = new anchor.BN(86_400);

export const SerializedLoanState = {
  Listed: 0,
  Active: 1,
  Defaulted: 2,
};

export const SerializedCallOptionState = {
  Listed: 0,
  Active: 1,
  Exercised: 2,
};
