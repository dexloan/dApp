import * as anchor from "@project-serum/anchor";

export const LISTINGS_PROGRAM_ID = new anchor.web3.PublicKey(
  "GDNxgyEcP6b2FtTtCGrGhmoy5AQEiwuv26hV1CLmL1yu"
);

export const SECONDS_PER_DAY = new anchor.BN(86_400);

export const SerializedLoanState = {
  Listed: 1,
  Active: 2,
  Defaulted: 3,
};

export const SerializedCallOptionState = {
  Listed: 0,
  Active: 1,
  Exercised: 2,
};

export const SIGNER = new anchor.web3.PublicKey(
  process.env.NEXT_PUBLIC_SIGNER as string
);
