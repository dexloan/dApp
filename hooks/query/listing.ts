import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useQuery } from "react-query";

import { ListingState } from "../../common/types";
import { listing } from "../../common/query";

export const getListingQueryKey = (
  listing: anchor.web3.PublicKey | undefined
) => ["listing", listing?.toBase58()];

export function useListingQuery(
  connection: anchor.web3.Connection,
  listingAddress: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getListingQueryKey(listingAddress),
    () => {
      if (listingAddress)
        return listing.fetchListing(connection, listingAddress);
    },
    { enabled: Boolean(listingAddress) }
  );
}

export const getListingsQueryKey = () => ["listings"];

export function useListingsQuery(connection: anchor.web3.Connection) {
  return useQuery(
    getListingsQueryKey(),
    () =>
      listing.fetchMultipleListings(connection, [
        {
          memcmp: {
            // filter listed
            offset: 7 + 1,
            bytes: bs58.encode(
              new anchor.BN(ListingState.Listed).toArrayLike(Buffer)
            ),
          },
        },
      ]),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getBorrowingsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["borrowings", walletAddress?.toBase58()];

export function useBorrowingsQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getBorrowingsQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return listing.fetchMultipleListings(connection, [
          {
            memcmp: {
              // filter borrower
              offset: 7 + 1 + 8 + 1,
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(wallet),
      refetchOnWindowFocus: false,
    }
  );
}

export const getPersonalLoansQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans", walletAddress?.toBase58()];

export function usePersonalLoansQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getPersonalLoansQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return listing.fetchMultipleListings(connection, [
          {
            memcmp: {
              // filter lender
              offset: 7 + 1 + 8 + 32 + 1,
              bytes: wallet?.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(wallet?.publicKey),
      refetchOnWindowFocus: false,
    }
  );
}
