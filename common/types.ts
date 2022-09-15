import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { DexloanListings, IDL } from "./idl/dexloan";

export enum ListingState {
  Initialized = 0,
  Listed = 1,
  Active = 2,
  Repaid = 3,
  Cancelled = 4,
  Defaulted = 5,
}

export enum LoanStateEnum {
  Listed = "listed",
  Active = "active",
  Defaulted = "defaulted",
  Repaid = "repaid",
  Cancelled = "cancelled",
}

export enum CallOptionStateEnum {
  Listed = "listed",
  Active = "active",
  Exercised = "exercised",
  Cancelled = "cancelled",
}

export enum HireStateEnum {
  Listed = "listed",
  Hired = "hired",
  Cancelled = "cancelled",
}

export interface NFTResult {
  tokenAccount: {
    pubkey: anchor.web3.PublicKey;
    data: splToken.RawAccount;
  };
  metadata: Metadata;
}

export interface CollectionItem {
  symbol: string;
  name: string;
  items: NFTResult[];
}

export interface CollectionMap {
  [key: string]: CollectionItem;
}

export type CallOptionData = TypeDef<
  typeof IDL["accounts"][0],
  DexloanListings
>;
export type Collection = TypeDef<typeof IDL["accounts"][1], DexloanListings>;
export type HireData = TypeDef<typeof IDL["accounts"][2], DexloanListings>;
export type LoanData = TypeDef<typeof IDL["accounts"][3], DexloanListings>;
export type TokenManagerData = TypeDef<
  typeof IDL["accounts"][3],
  DexloanListings
>;

interface Result {
  publicKey: anchor.web3.PublicKey;
  metadata: Metadata;
}

export interface LoanResult extends Result {
  data: LoanData;
}

export interface CallOptionResult extends Result {
  data: CallOptionData;
}
