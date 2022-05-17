import * as anchor from "@project-serum/anchor";
import * as splToken from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

export enum ListingState {
  Initialized = 0,
  Listed = 1,
  Active = 2,
  Repaid = 3,
  Cancelled = 4,
  Defaulted = 5,
}

export interface NFTResult {
  accountInfo: {
    pubkey: anchor.web3.PublicKey;
    data: splToken.RawAccount;
  };
  metadata: Metadata;
}

export interface CollectionMap {
  [key: string]: {
    name: string;
    items: NFTResult[];
  };
}
