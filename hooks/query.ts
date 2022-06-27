import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useQuery } from "react-query";

import { ListingState } from "../common/types";
import {
  fetchListing,
  fetchLoan,
  fetchCallOption,
  fetchMultipleListings,
  fetchMultipleLoans,
  fetchMultipleCallOptions,
  fetchNFTs,
} from "../common/query";

export const getNFTByOwnerQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["wallet-nfts", walletAddress?.toBase58()];

export function useNFTByOwnerQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getNFTByOwnerQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return fetchNFTs(connection, wallet.publicKey);
      }
    },
    {
      enabled: Boolean(wallet?.publicKey),
      refetchOnWindowFocus: false,
    }
  );
}

export const getMetadataFileQueryKey = (uri?: string) => ["metadataFile", uri];

export function useMetadataFileQuery(uri?: string) {
  return useQuery(
    getMetadataFileQueryKey(uri),
    () => {
      if (uri) {
        return fetch(uri).then((response) => {
          return response.json().then((data) => data);
        });
      }
    },
    {
      enabled: Boolean(uri),
      refetchOnWindowFocus: false,
    }
  );
}

export const getListingQueryKey = (
  listing: anchor.web3.PublicKey | undefined
) => ["listing", listing?.toBase58()];

export function useListingQuery(
  connection: anchor.web3.Connection,
  listing: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getListingQueryKey(listing),
    () => {
      if (listing) return fetchListing(connection, listing);
    },
    { enabled: Boolean(listing) }
  );
}

export const getLoanQueryKey = (loan: anchor.web3.PublicKey | undefined) => [
  "loan",
  loan?.toBase58(),
];

export function useLoanQuery(
  connection: anchor.web3.Connection,
  loan: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getLoanQueryKey(loan),
    () => {
      if (loan) return fetchLoan(connection, loan);
    },
    { enabled: Boolean(loan) }
  );
}

export const getCallOptionQueryKey = (
  callOption: anchor.web3.PublicKey | undefined
) => ["callOption", callOption?.toBase58()];

export function useCallOptionQuery(
  connection: anchor.web3.Connection,
  callOption: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getCallOptionQueryKey(callOption),
    () => {
      if (callOption) return fetchLoan(connection, callOption);
    },
    { enabled: Boolean(callOption) }
  );
}

export const getListingsQueryKey = () => ["listings"];

export function useListingsQuery(connection: anchor.web3.Connection) {
  return useQuery(
    getListingsQueryKey(),
    () =>
      fetchMultipleListings(connection, [
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

export const getLoansQueryKey = () => ["loans"];

export function useLoansQuery(connection: anchor.web3.Connection) {
  return useQuery(
    getListingsQueryKey(),
    () =>
      fetchMultipleLoans(connection, [
        // {
        //   memcmp: {
        //     // filter listed
        //     offset: 7 + 1,
        //     bytes: bs58.encode(
        //       new anchor.BN(ListingState.Listed).toArrayLike(Buffer)
        //     ),
        //   },
        // },
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
        return fetchMultipleListings(connection, [
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
        return fetchMultipleListings(connection, [
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

export const useFloorPriceQuery = (symbol?: string) => {
  return useQuery(
    ["floorPrice", symbol],
    async () => {
      if (symbol) {
        const response = await fetch(`/api/floor/${symbol}`);
        return response.json();
      }
    },
    {
      enabled: symbol !== "undefined",
      staleTime: 1000 * 60 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );
};
