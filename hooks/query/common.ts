import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import { fetchNFTs } from "../../common/query";

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
