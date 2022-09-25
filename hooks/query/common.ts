import * as anchor from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useQuery, useQueryClient } from "react-query";

import {
  fetchNFT,
  fetchNFTs,
  fetchTokenAccountAddress,
} from "../../common/query";
import { NFTResult } from "../../common/types";

export const getNFTCacheKey = (mint: anchor.web3.PublicKey) => [
  "nft",
  mint.toBase58(),
];

export function useNFT(mint: anchor.web3.PublicKey) {
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getNFTCacheKey(mint),
    () => {
      if (anchorWallet?.publicKey) {
        const walletNFTs = queryClient.getQueryData<NFTResult[]>(
          getNFTByOwnerCacheKey(anchorWallet?.publicKey)
        );

        if (walletNFTs) {
          const nft = walletNFTs.find((data) =>
            data.metadata.mint.equals(mint)
          );

          if (nft) return nft;
        }
      }

      return fetchNFT(connection, mint);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getNFTByOwnerCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["wallet_nfts", walletAddress?.toBase58()];

export function useNFTByOwnerQuery(wallet?: AnchorWallet) {
  const { connection } = useConnection();

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
        return response.json() as Promise<{ floorPrice: number }>;
      }
    },
    {
      enabled: symbol !== "undefined",
      staleTime: 1000 * 60 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );
};
