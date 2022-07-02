import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { DexloanListings, IDL } from "./idl/Dexloan";

export enum ListingState {
  Initialized = 0,
  Listed = 1,
  Active = 2,
  Repaid = 3,
  Cancelled = 4,
  Defaulted = 5,
}

export interface NFTResult {
  tokenAccount: {
    pubkey: anchor.web3.PublicKey;
    data: splToken.RawAccount;
  };
  metadata: Metadata;
}

export interface Collection {
  symbol: string;
  name: string;
  items: NFTResult[];
}

export interface CollectionMap {
  [key: string]: Collection;
}

export type CallOptionData = TypeDef<
  typeof IDL["accounts"][0],
  DexloanListings
>;
export type Listing = TypeDef<typeof IDL["accounts"][1], DexloanListings>;
export type Loan = TypeDef<typeof IDL["accounts"][2], DexloanListings>;

interface Result {
  publicKey: anchor.web3.PublicKey;
  metadata: Metadata;
}

export interface ListingResult extends Result {
  data: Listing;
}

export interface LoanResult extends Result {
  data: Loan;
}

export interface CallOptionResult extends Result {
  data: CallOptionData;
}
