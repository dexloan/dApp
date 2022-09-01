import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";

export const useHireAddressQuery = (
  mint?: anchor.web3.PublicKey,
  lender?: anchor.web3.PublicKey
) => {
  return useQuery(
    ["hire_address", mint?.toBase58(), lender?.toBase58()],
    () => {
      if (mint && lender) {
        return query.findHireAddress(mint, lender);
      }
    },
    { enabled: Boolean(mint && lender) }
  );
};

export const getHireCacheKey = (
  hireAddress: anchor.web3.PublicKey | undefined
) => ["hire", hireAddress?.toBase58()];

export function useHireQuery(hireAddress: anchor.web3.PublicKey | undefined) {
  const { connection } = useConnection();

  return useQuery(
    getHireCacheKey(hireAddress),
    () => {
      if (hireAddress) return query.fetchHire(connection, hireAddress);
    },
    { enabled: Boolean(hireAddress) }
  );
}

export const getHiresCacheKey = () => ["hires"];

export function useHiresQuery() {
  const { connection } = useConnection();

  return useQuery(
    getHiresCacheKey(),
    () => {
      return query.fetchMultipleHires(connection, [
        // {
        //   memcmp: {
        //     // filter listed
        //     offset: 8,
        //     bytes: bs58.encode([0]),
        //   },
        // },
      ]);
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getHiresGivenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["hires_given", walletAddress?.toBase58()];

export function useLenderHiresQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getHiresGivenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleHires(connection, [
          {
            memcmp: {
              // filter lender
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

export const getHiresTakenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["hires_taken", walletAddress?.toBase58()];

export function useBorrowerHiresQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getHiresTakenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleHires(connection, [
          {
            memcmp: {
              // filter borrower
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
