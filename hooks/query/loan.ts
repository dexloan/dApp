import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LoanState } from "@prisma/client";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

import * as query from "../../common/query";
import {
  LoanJson,
  LoanOfferJson,
  GroupedLoanOfferJson,
} from "../../common/types";
import { LoanSortCols } from "../../components/tables";

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
  collections?: string[];
  orderBy?: LoanSortCols;
  sortOrder?: "asc" | "desc";
}

export const getLoansQueryKey = (filters?: LoanFilters) => ["loans", filters];

const mapLoanColToPrismaCol = (col: LoanSortCols) => {
  return {
    asset: "collectionAddress",
    collection: "collectionAddress",
    ltv: undefined,
    amount: "amount",
    apy: "basisPoints",
    duration: "duration",
  }[col];
};

export function useLoansQuery({
  state,
  collections,
  orderBy,
  sortOrder,
}: LoanFilters = {}) {
  return useQuery<void, unknown, LoanJson[]>(
    getLoansQueryKey({ state, collections, orderBy, sortOrder }),
    async () => {
      const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loans/asks`);

      if (state) {
        url.searchParams.append("state", state);
      }
      if (orderBy) {
        const prismaCol = mapLoanColToPrismaCol(orderBy);
        if (prismaCol) {
          url.searchParams.append("orderBy", prismaCol);
        }
      }
      if (sortOrder) {
        url.searchParams.append("sortOrder", sortOrder);
      }
      if (collections) {
        collections.forEach((address) =>
          url.searchParams.append("collectionAddress", address)
        );
      }
      console.log("url", url.toString());
      return fetch(url).then((res) => res.json());
    },
    {
      refetchOnWindowFocus: false,
    }
  );
}

interface LoanOfferFilters extends Omit<LoanFilters, "state"> {
  lender?: string;
}

export const getGroupedLoanOffersCacheKey = (filters?: LoanOfferFilters) => [
  "loan_offers",
  "grouped",
  filters,
];

export function fetchGroupedLoanOffers({
  collections,
  orderBy,
  sortOrder,
}: LoanOfferFilters = {}): Promise<GroupedLoanOfferJson[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_HOST}/api/loans/offers/grouped`
  );
  if (orderBy) {
    const prismaCol = mapLoanColToPrismaCol(orderBy);
    if (prismaCol) {
      url.searchParams.append("orderBy", prismaCol);
    }
  }
  if (sortOrder) {
    url.searchParams.append("sortOrder", sortOrder);
  }
  if (collections) {
    collections.forEach((address) =>
      url.searchParams.append("collectionAddress", address)
    );
  }
  return fetch(url).then((res) => res.json());
}

export function useGroupedLoanOffersQuery(filters: LoanOfferFilters = {}) {
  return useQuery(
    getGroupedLoanOffersCacheKey(filters),
    () => fetchGroupedLoanOffers(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoanOffersByLenderCacheKey = (filters?: LoanOfferFilters) => [
  "loan_offers",
  filters,
];

export function fetchLoanOffers({
  lender,
  collections = [],
}: LoanOfferFilters = {}): Promise<LoanOfferJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loans/offers`);
  if (lender) {
    url.searchParams.append("lender", lender);
  }
  if (collections) {
    collections.forEach((address) =>
      url.searchParams.append("collectionAddress", address)
    );
  }

  return fetch(url).then((res) => res.json());
}

export function useLoanOffersByLenderQuery(filters: LoanOfferFilters = {}) {
  return useQuery(
    getLoanOffersByLenderCacheKey(filters),
    () => fetchLoanOffers(filters),
    {
      enabled: Boolean(filters.lender),
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
