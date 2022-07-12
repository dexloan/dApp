import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";

export const getCallOptionQueryKey = (
  callOptionAddress: anchor.web3.PublicKey | undefined
) => ["callOption", callOptionAddress?.toBase58()];

export function useCallOptionQuery(
  callOptionAddress: anchor.web3.PublicKey | undefined
) {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionQueryKey(callOptionAddress),
    () => {
      if (callOptionAddress)
        return query.fetchCallOption(connection, callOptionAddress);
    },
    { enabled: Boolean(callOptionAddress) }
  );
}

export const getCallOptionsQueryKey = () => ["callOptions"];

export function useCallOptionsQuery() {
  const { connection } = useConnection();

  return useQuery(
    getCallOptionsQueryKey(),
    () => {
      return query.fetchMultipleCallOptions(connection, [
        {
          memcmp: {
            // filter listed
            offset: 8,
            bytes: bs58.encode([0]),
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
              offset: 8 + 8 + 1,
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
              offset: 8 + 8 + 32 + 1,
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
