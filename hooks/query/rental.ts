import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";

export const useRentalAddressQuery = (
  mint?: anchor.web3.PublicKey,
  lender?: anchor.web3.PublicKey
) => {
  return useQuery(
    ["hire_address", mint?.toBase58(), lender?.toBase58()],
    () => {
      if (mint && lender) {
        return query.findRentalAddress(mint, lender);
      }
    },
    { enabled: Boolean(mint && lender) }
  );
};

export const getRentalCacheKey = (
  hireAddress: anchor.web3.PublicKey | undefined
) => ["rental", hireAddress?.toBase58()];

export function useRentalQuery(hireAddress: anchor.web3.PublicKey | undefined) {
  const { connection } = useConnection();

  return useQuery(
    getRentalCacheKey(hireAddress),
    () => {
      if (hireAddress) return query.fetchRental(connection, hireAddress);
    },
    { enabled: Boolean(hireAddress) }
  );
}

export const getRentalsCacheKey = () => ["hires"];

export function useRentalsQuery() {
  const { connection } = useConnection();

  return useQuery(
    getRentalsCacheKey(),
    () => {
      return query.fetchMultipleRentals(connection, [
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

export const getRentalsGivenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["hires_given", walletAddress?.toBase58()];

export function useLenderRentalsQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getRentalsGivenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleRentals(connection, [
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

export const getRentalsTakenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["hires_taken", walletAddress?.toBase58()];

export function useRentalsTakenQuery() {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();

  return useQuery(
    getRentalsTakenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleRentals(connection, [
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
