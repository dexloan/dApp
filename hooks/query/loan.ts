import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";
import { LoanState } from "@prisma/client";
import { useRouter } from "next/router";

export const useLoanAddress = (
  mint?: anchor.web3.PublicKey,
  borrower?: anchor.web3.PublicKey
) => {
  const [address, setAddress] = useState<anchor.web3.PublicKey>();

  useEffect(() => {
    if (mint && borrower) {
      query.findLoanAddress(mint, borrower).then((a) => setAddress(a));
    }
  }, [mint, borrower]);

  return address;
};

export const getLoanCacheKey = (
  loanAddress: anchor.web3.PublicKey | undefined
) => ["loan", loanAddress?.toBase58()];

export function useLoanQuery(loanAddress: anchor.web3.PublicKey | undefined) {
  const { connection } = useConnection();

  return useQuery(
    getLoanCacheKey(loanAddress),
    () => {
      if (loanAddress) return query.fetchLoan(connection, loanAddress);
    },
    { enabled: Boolean(loanAddress) }
  );
}

interface LoanFilters {
  state?: LoanState;
  collection?: string;
}

export const getLoansQueryKey = (filters: LoanFilters) => ["loans", filters];

export function useLoansQuery({ state, collection }: LoanFilters = {}) {
  return useQuery(
    getLoansQueryKey({ state, collection }),
    async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loans/asks`);

      if (state) {
        url.searchParams.append("state", state);
      }
      if (collection) {
        url.searchParams.append("collectionAddress", collection);
      }

      return fetch(url).then((res) => res.json());
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoanOffersCacheKey = () => ["loan_offers"];

export function useLoanOffersQuery() {
  return useQuery(
    getLoanOffersCacheKey(),
    () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loan/offers`);
      return fetch(url).then((res) => res.json());
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoanOffersByLenderCacheKey = (
  lender?: anchor.web3.PublicKey | null
) => ["loan_offers", lender?.toBase58()];

export function useLoanOffersByLenderQuery(
  lender?: anchor.web3.PublicKey | null
) {
  const { connection } = useConnection();

  return useQuery(
    getLoanOffersByLenderCacheKey(lender),
    () => {
      if (lender) {
        return query.fetchMultipleLoanOffers(connection, [
          {
            memcmp: {
              offset: 8 + 1,
              bytes: lender.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(lender),
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoansTakenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans_taken", walletAddress?.toBase58()];

export function useLoansTakenQuery() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getLoansTakenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter borrower
              offset: 27, // ??
              bytes: anchorWallet.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(anchorWallet),
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoansGivenCacheKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans_given", walletAddress?.toBase58()];

export function useLoansGivenQuery() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getLoansGivenCacheKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter lender
              offset: 28 + 32, // ??
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
