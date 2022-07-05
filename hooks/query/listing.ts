import * as anchor from "@project-serum/anchor";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useQuery } from "react-query";

import * as query from "../../common/query";
import { ListingState } from "../../common/types";

export const getListingQueryKey = (
  listing: anchor.web3.PublicKey | undefined
) => ["deprecated_listing", listing?.toBase58()];

export function useListingQuery(
  listingAddress: anchor.web3.PublicKey | undefined
) {
  const { connection } = useConnection();

  return useQuery(
    getListingQueryKey(listingAddress),
    () => {
      if (listingAddress) return query.fetchListing(connection, listingAddress);
    },
    { enabled: Boolean(listingAddress) }
  );
}

export const getListingsQueryKey = () => ["deprecated_listings"];

export function useListingsQuery() {
  const { connection } = useConnection();

  return useQuery(
    getListingsQueryKey(),
    () =>
      query.fetchMultipleListings(connection, [
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

export const getPersonalListingsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["deprecated_borrowings", walletAddress?.toBase58()];

export function usePersonalListingsQuery() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getPersonalListingsQueryKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleListings(connection, [
          {
            memcmp: {
              // filter borrower
              offset: 7 + 1 + 8 + 1,
              bytes: anchorWallet.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(anchorWallet),
      refetchOnWindowFocus: false,
    }
  );
}
