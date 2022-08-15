import * as anchor from "@project-serum/anchor";
import { AnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import { fetchNFTs, fetchTokenAccountAddress } from "../../common/query";

export const getNFTByOwnerCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["wallet_nfts", walletAddress?.toBase58()];

export function useNFTByOwnerQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getNFTByOwnerCacheKey(wallet?.publicKey),
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

export const useTokenAccountQuery = (
  wallet?: anchor.web3.PublicKey,
  mint?: anchor.web3.PublicKey
) => {
  const { connection } = useConnection();

  return useQuery(
    ["token_account", wallet?.toBase58(), mint?.toBase58()],
    async () => {
      console.log("fetchTokenAccountAddress: ", fetchTokenAccountAddress);
      if (wallet && mint) {
        return fetchTokenAccountAddress(connection, wallet, mint);
      }
    },
    {
      enabled: Boolean(wallet && mint),
    }
  );
};

export const getMetadataFileCacheKey = (uri?: string) => ["metadata_file", uri];

export function useMetadataFileQuery(uri?: string) {
  return useQuery(
    getMetadataFileCacheKey(uri),
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
