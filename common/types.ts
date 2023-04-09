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
import {
  TypeDef,
  IdlTypes,
} from "@project-serum/anchor/dist/cjs/program/namespace/types";
import { OndaListings, IDL as LISTINGS_IDL } from "./idl/OndaListings";
import { OndaSocial, IDL as SOCIAL_IDL } from "./idl/OndaSocial";

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
  typeof LISTINGS_IDL["accounts"][0],
  OndaListings
>;
export type CallOptionBidData = TypeDef<
  typeof LISTINGS_IDL["accounts"][1],
  OndaListings
>;
export type CollectionData = TypeDef<
  typeof LISTINGS_IDL["accounts"][2],
  OndaListings
>;
export type LoanData = TypeDef<
  typeof LISTINGS_IDL["accounts"][3],
  OndaListings
>;
export type LoanOfferData = TypeDef<
  typeof LISTINGS_IDL["accounts"][4],
  OndaListings
>;
export type RentalData = TypeDef<
  typeof LISTINGS_IDL["accounts"][5],
  OndaListings
>;
export type TokenManagerData = TypeDef<
  typeof LISTINGS_IDL["accounts"][6],
  OndaListings
>;

export type CollectionConfig = TypeDef<
  typeof LISTINGS_IDL["types"][1],
  OndaListings
>;
export type TokenManagerAccountState = TypeDef<
  typeof LISTINGS_IDL["types"][2],
  OndaListings
>;

export type OndaSocialTypes = IdlTypes<OndaSocial>;
export type EntryData = OndaSocialTypes["EntryData"];
export type LeafSchema = OndaSocialTypes["LeafSchema"];
