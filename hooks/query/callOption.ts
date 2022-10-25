import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";

export const getCallOptionBidsCacheKey = () => ["call_option_bids"];

export function useCallOptionBidsQuery() {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionBidsCacheKey(),
    () => query.fetchMultipleCallOptionBids(connection, []),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const useCallOptionBidsByBuyerCacheKey = (
  buyer?: anchor.web3.PublicKey | null
) => ["call_option_bids", buyer?.toBase58()];

export function useCallOptionBidsByBuyerQuery(
  buyer?: anchor.web3.PublicKey | null
) {
  const { connection } = useConnection();

  return useQuery(
    useCallOptionBidsByBuyerCacheKey(buyer),
    () => {
      if (buyer) {
        return query.fetchMultipleCallOptionBids(connection, [
          {
            memcmp: {
              offset: 8 + 1,
              bytes: buyer.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(buyer),
      refetchOnWindowFocus: false,
    }
  );
}

export const useCallOptionAddressQuery = (
  mint?: anchor.web3.PublicKey,
  seller?: anchor.web3.PublicKey
) => {
  return useQuery(
    ["call_option_address", mint?.toBase58(), seller?.toBase58()],
    () => {
      if (mint && seller) {
        return query.findCallOptionAddress(mint, seller);
      }
    },
    { enabled: Boolean(mint && seller) }
  );
};

export const getCallOptionCacheKey = (
  callOptionAddress: anchor.web3.PublicKey | undefined
) => ["callOption", callOptionAddress?.toBase58()];

export function useCallOptionQuery(
  callOptionAddress: anchor.web3.PublicKey | undefined
) {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionCacheKey(callOptionAddress),
    () => {
      if (callOptionAddress)
        return query.fetchCallOption(connection, callOptionAddress);
    },
    { enabled: Boolean(callOptionAddress) }
  );
}

export const getCallOptionsCacheKey = (state: number) => ["callOptions", state];

export function useCallOptionsQuery(state: number) {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionsCacheKey(state),
    () => {
      return query.fetchMultipleCallOptions(connection, [
        {
          memcmp: {
            // filter listed
            offset: 8,
            bytes: bs58.encode([state]),
          },
        },
      ]);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getSellerCallOptionsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["sellerCallOptions", walletAddress?.toBase58()];

export function useSellerCallOptionsQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getSellerCallOptionsQueryKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleCallOptions(connection, [
          {
            memcmp: {
              // filter seller
              offset: 8 + 1 + 8,
              bytes: anchorWallet.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(anchorWallet?.publicKey),
      refetchOnWindowFocus: false,
    }
  );
}

export const getBuyerCallOptionsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["buyerCallOptions", walletAddress?.toBase58()];

export function useBuyerCallOptionsQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getBuyerCallOptionsQueryKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleCallOptions(connection, [
          {
            memcmp: {
              // filter lender
              offset: 8 + 1 + 8 + 32 + 1,
              bytes: anchorWallet?.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(anchorWallet?.publicKey),
      refetchOnWindowFocus: false,
    }
  );
}
