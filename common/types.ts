import * as splToken from "@solana/spl-token";
import type {
  Collection,
  Loan,
  LoanState,
  CallOptionState,
  RentalState,
} from "@prisma/client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { DexloanListings, IDL } from "./idl";

export type LoanStateEnum = LoanState;
export type CallOptionStateEnum = CallOptionState;
export type RentalStateEnum = RentalState;

export interface LoanWithCollection extends Loan {
  Collection: Collection;
}

export interface NftResult {
  tokenAccount: splToken.Account;
  metadata: Metadata;
}

export interface CollectionItem {
  symbol: string;
  name: string;
  items: NftResult[];
}

export interface CollectionMap {
  [key: string]: CollectionItem;
}

export type CallOptionData = TypeDef<
  typeof IDL["accounts"][0],
  DexloanListings
>;
export type CallOptionBidData = TypeDef<
  typeof IDL["accounts"][1],
  DexloanListings
>;
export type CollectionData = TypeDef<
  typeof IDL["accounts"][2],
  DexloanListings
>;
export type LoanData = TypeDef<typeof IDL["accounts"][3], DexloanListings>;
export type LoanOfferData = TypeDef<typeof IDL["accounts"][4], DexloanListings>;
export type RentalData = TypeDef<typeof IDL["accounts"][5], DexloanListings>;
export type TokenManagerData = TypeDef<
  typeof IDL["accounts"][6],
  DexloanListings
>;

export type CollectionConfig = TypeDef<typeof IDL["types"][1], DexloanListings>;
export type TokenManagerAccountState = TypeDef<
  typeof IDL["types"][2],
  DexloanListings
>;
