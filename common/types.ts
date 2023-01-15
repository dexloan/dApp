import * as splToken from "@solana/spl-token";
import type {
  Collection,
  Loan,
  LoanState,
  LoanOffer,
  CallOption,
  CallOptionState,
  CallOptionBid,
  RentalState,
} from "@prisma/client";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { TypeDef } from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { DexloanListings, IDL } from "./idl";

export type SortDirection = "asc" | "desc";

export type { LoanState };
export type CallOptionStateEnum = CallOptionState;
export type RentalStateEnum = RentalState;

export interface CollectionJson extends Omit<Collection, "floorPrice"> {
  floorPrice: string;
}

export interface LoanJson
  extends Omit<
    Loan,
    "amount" | "outstanding" | "noticeIssued" | "duration" | "startDate"
  > {
  amount: string | null;
  outstanding: string;
  noticeIssued: string | null;
  duration: string;
  startDate: string | null;
  Collection: CollectionJson;
}

export interface LoanOfferJson extends Omit<LoanOffer, "amount" | "duration"> {
  amount: string | null;
  duration: string;
  Collection: CollectionJson;
}

export interface GroupedLoanOfferJson {
  _count: number;
  amount: string | null;
  basisPoints: number;
  duration: string;
  Collection: CollectionJson;
}

export interface CallOptionJson
  extends Omit<CallOption, "amount" | "strikePrice" | "expiry"> {
  amount: string;
  strikePrice: string;
  expiry: string;
  Collection: CollectionJson;
}

export interface CallOptionBidJson
  extends Omit<CallOptionBid, "amount" | "strikePrice" | "expiry"> {
  amount: string;
  strikePrice: string;
  expiry: string;
  Collection: CollectionJson;
}

export interface GroupedCallOptionBidJson {
  _count: number;
  amount: string;
  strikePrice: string;
  expiry: string;
  Collection: CollectionJson;
}

export interface NftResult {
  tokenAccount: splToken.Account;
  tokenManager: TokenManagerData | null;
  metadata: Metadata;
}

export interface CollectionItem {
  mint: string;
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
