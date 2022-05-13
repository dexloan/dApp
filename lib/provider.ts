import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import IDL from "../idl.json";
import { DexloanListings } from "../dexloan";

export const PROGRAM_ID = new anchor.web3.PublicKey(
  "H6FCxCy2KCPJwCoUb9eQCSv41WZBKQaYfB6x5oFajzfj"
);

export function getProgram(
  provider: anchor.Provider
): anchor.Program<DexloanListings> {
  return new anchor.Program(IDL as any, PROGRAM_ID, provider);
}

export function getProvider(
  connection: anchor.web3.Connection,
  wallet: AnchorWallet
): anchor.Provider {
  return new anchor.AnchorProvider(
    connection,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
}
