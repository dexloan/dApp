import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { DexloanListings, IDL } from "./idl";

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

export type Listing = TypeDef<typeof IDL["accounts"][0], DexloanListings>;
export interface ListingResult {
  publicKey: anchor.web3.PublicKey;
  listing: Listing;
  metadata: Metadata;
}
