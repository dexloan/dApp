import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useQuery } from "react-query";

import { ListingState } from "../common/types";
import {
  fetchListing,
  fetchMagicEdenCollectionStats,
  fetchMultipleListings,
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

export const getLoansQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans", walletAddress?.toBase58()];

export function useLoansQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getLoansQueryKey(wallet?.publicKey),
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

export const useMagicEdenCollectionsQuery = () => {
  return useQuery(
    ["magic-eden-collection-stats"],
    () =>
      Promise.all([
        fetchMagicEdenCollectionStats("chicken_tribe"),
        fetchMagicEdenCollectionStats("exiled_degen_ape_academy"),
        fetchMagicEdenCollectionStats("lgtb"),
      ]),
    {
      staleTime: 1000 * 60 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );
};
