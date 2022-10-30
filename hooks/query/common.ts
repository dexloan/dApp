import * as anchor from "@project-serum/anchor";
import { AnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import { fetchNfts, fetchTokenAccountAddress } from "../../common/query";

export const getNftByOwnerCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["wallet_nfts", walletAddress?.toBase58()];

export function useNFTByOwnerQuery(wallet?: AnchorWallet) {
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
