import * as anchor from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";

import * as utils from "../../common/utils";
import {
  fetchMetadata,
  fetchNft,
  fetchNfts,
  fetchTokenManager,
  fetchTokenAccountAddress,
} from "../../common/query";
import { NftResult } from "../../common/types";

export const getMetadataCacheKey = (mint?: String) => ["metadata", mint];

export function useMetadataQuery(mint?: string) {
  const { connection } = useConnection();

  return useQuery(
    getMetadataCacheKey(mint),
    () => {
      if (!mint) {
        throw new Error("Mint not defined");
      }

      return fetchMetadata(connection, new anchor.web3.PublicKey(mint));
    },
    {
      enabled: mint !== undefined,
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

export const useTokenManagerQuery = (
  mint: anchor.web3.PublicKey,
  issuer: anchor.web3.PublicKey | null
) => {
  const { connection } = useConnection();

  return useQuery(
    ["tokenManager", mint?.toBase58(), issuer?.toBase58()],
    () => {
      if (mint && issuer) {
        return fetchTokenManager(connection, mint, issuer);
      }
    },
    { enabled: Boolean(mint && issuer) }
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
