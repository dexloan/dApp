import * as anchor from "@project-serum/anchor";

export const LISTINGS_PROGRAM_ID = new anchor.web3.PublicKey(
  "8hSdpqHU7jz4C6C1kHUPQNMqBcC76n1BFXbHaTwd9X4c"
);

export const RPC_ENDPOINT =
  "https://fragrant-capable-theorem.solana-mainnet.discover.quiknode.pro/";

export const BACKEND_RPC_ENDPOINT = "https://ssc-dao.genesysgo.net/";

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

export const SIGNER = null;
