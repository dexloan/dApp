import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

import * as utils from "../utils";
import { LISTINGS_PROGRAM_ID } from "../constants";
import { CollectionData, LoanData, LoanJson, LoanOfferData } from "../types";
import { getProgram, getProvider } from "../provider";
import { fetchMetadata, fetchMetadataAccounts } from "./common";

/**
 * KEYS
 */
// export const loanKeys = {
//   all: () => ["loans"] as const,
//   list: (filter: anchor.web3.GetProgramAccountsFilter[] = []) =>
//     ["loans", "list", ...filter] as const,
//   byAddress: (address: anchor.web3.PublicKey) =>
//     ["loans", "details", address.toBase58()] as const,
// };

// export const offerKeys = {
//   all: () => ["offers"] as const,
//   list: (filter: anchor.web3.GetProgramAccountsFilter[] = []) =>
//     ["offers", "list", ...filter] as const,
//   byAddress: (address: anchor.web3.PublicKey) =>
//     ["offers", "details", address.toBase58()] as const,
// };

/**
 * PDAs
 */
export async function findLoanAddress(
  mint: anchor.web3.PublicKey,
  borrower: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [loanAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("loan"), mint.toBuffer(), borrower.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return loanAddress;
}

export async function findLoanOfferAddress(
  collection: anchor.web3.PublicKey,
  lender: anchor.web3.PublicKey,
  id: number
): Promise<anchor.web3.PublicKey> {
  const [loanOfferAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from("loan_offer"),
      collection.toBuffer(),
      lender.toBuffer(),
      new anchor.BN(id).toArrayLike(Buffer),
    ],
    LISTINGS_PROGRAM_ID
  );

  return loanOfferAddress;
}

export async function findLoanOfferVaultAddress(
  loanOffer: anchor.web3.PublicKey
): Promise<anchor.web3.PublicKey> {
  const [vaultAddress] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("loan_offer_vault"), loanOffer.toBuffer()],
    LISTINGS_PROGRAM_ID
  );

  return vaultAddress;
}
