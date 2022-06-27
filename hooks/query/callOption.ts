import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import { callOption } from "../../common/query";

export const getCallOptionQueryKey = (
  callOptionAddress: anchor.web3.PublicKey | undefined
) => ["callOption", callOptionAddress?.toBase58()];

export function useCallOptionQuery(
  connection: anchor.web3.Connection,
  callOptionAddress: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getCallOptionQueryKey(callOptionAddress),
    () => {
      if (callOptionAddress)
        return callOption.fetchCallOption(connection, callOptionAddress);
    },
    { enabled: Boolean(callOptionAddress) }
  );
}

export const getCallOptionsQueryKey = () => ["callOptions"];

export function useCallOptionsQuery(connection: anchor.web3.Connection) {
  return useQuery(
    getCallOptionsQueryKey(),
    () => {
      return callOption.fetchMultipleCallOptions(connection);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getSellerCallOptionsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["sellerCallOptions", walletAddress?.toBase58()];

export function useSellerCallOptionsQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getSellerCallOptionsQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return callOption.fetchMultipleCallOptions(connection, [
          {
            memcmp: {
              // filter seller
              offset: 8 + 8 + 1,
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

export const getBuyerCallOptionsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["buyerCallOptions", walletAddress?.toBase58()];

export function usePersonalLoansQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getBuyerCallOptionsQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return callOption.fetchMultipleCallOptions(connection, [
          {
            memcmp: {
              // filter lender
              offset: 8 + 8 + 32 + 1,
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
