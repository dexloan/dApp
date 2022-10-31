import * as anchor from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useQuery, useQueryClient } from "react-query";

import {
  fetchMetadata,
  fetchNft,
  fetchNfts,
  fetchTokenAccountAddress,
} from "../../common/query";
import { NftResult } from "../../common/types";

export const getMetadataCacheKey = (mint?: anchor.web3.PublicKey) => [
  "metadata",
  mint instanceof anchor.web3.PublicKey ? mint.toBase58() : undefined,
];

export function useMetadataQuery(mint?: anchor.web3.PublicKey) {
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getMetadataCacheKey(mint),
    () => {
      if (!mint) {
        throw new Error("Mint not defined");
      }

      if (anchorWallet?.publicKey) {
        const walletNFTs = queryClient.getQueryData<NftResult[]>(
          getNftByOwnerCacheKey(anchorWallet?.publicKey)
        );

        if (walletNFTs) {
          const nft = walletNFTs.find((data) =>
            data.metadata.mint.equals(mint)
          );

          if (nft) return nft.metadata;
        }
      }

      return fetchMetadata(connection, mint);
    },
    {
      enabled: Boolean(mint instanceof anchor.web3.PublicKey),
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
}

export const getNFTCacheKey = (mint: anchor.web3.PublicKey) => [
  "nft",
  mint.toBase58(),
];

export function useNft(mint: anchor.web3.PublicKey) {
  const { connection } = useConnection();
  const queryClient = useQueryClient();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getNFTCacheKey(mint),
    () => {
      if (anchorWallet?.publicKey) {
        const walletNFTs = queryClient.getQueryData<NftResult[]>(
          getNftByOwnerCacheKey(anchorWallet?.publicKey)
        );

        if (walletNFTs) {
          const nft = walletNFTs.find((data) =>
            data.metadata.mint.equals(mint)
          );

          if (nft) return nft;
        }
      }

      return fetchNft(connection, mint);
    },
    {
      enabled: Boolean(mint),
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    }
  );
}

export const getNftByOwnerCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["wallet_nfts", walletAddress?.toBase58()];

export function useNftByOwnerQuery(wallet?: AnchorWallet) {
  const { connection } = useConnection();

  return useQuery(
    getNftByOwnerCacheKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return fetchNfts(connection, wallet.publicKey);
      }
    },
    {
      enabled: Boolean(wallet?.publicKey),
      refetchOnReconnect: false,
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
    () => {
      if (symbol) {
        return fetchFloorPrice(symbol);
      }
    },
    {
      enabled: symbol !== "undefined",
      staleTime: 1000 * 60 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );
};

export const useFloorPricesQuery = () => {
  return useQuery(["floorPrices"], async () => {
    const response = await fetch(`/api/floor`);
    return response.json() as Promise<Record<string, number>>;
  });
};

async function fetchFloorPrice(symbol: string) {
  const response = await fetch(`/api/floor/${symbol}`);
  return response.json() as Promise<{ floorPrice: number }>;
}
