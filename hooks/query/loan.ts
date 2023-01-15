import * as anchor from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
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

export interface LoanFilters {
  state?: LoanState;
  lender?: string;
  borrower?: string;
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

const appendQueryParams = (url: URL, params: LoanFilters) => {
  if (typeof params.state === "string") {
    url.searchParams.append("state", params.state);
  }

  if (typeof params.lender === "string") {
    url.searchParams.append("lender", params.lender);
  }

  if (typeof params.borrower === "string") {
    url.searchParams.append("borrower", params.borrower);
  }

  if (params.collections instanceof Array) {
    params.collections.forEach((address) =>
      url.searchParams.append("collectionAddress", address)
    );
  }

  if (typeof params.orderBy === "string") {
    const prismaCol = mapLoanColToPrismaCol(params.orderBy);

    if (prismaCol) {
      url.searchParams.append("orderBy", prismaCol);
    }
  }

  if (typeof params.sortOrder === "string") {
    url.searchParams.append("sortOrder", params.sortOrder);
  }
};

export function fetchLoans(filters: LoanFilters): Promise<LoanJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loans/asks`);

  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useLoansQuery(filters: LoanFilters = {}) {
  return useQuery(getLoansQueryKey(filters), () => fetchLoans(filters), {
    refetchOnWindowFocus: false,
  });
}

export interface LoanOfferFilters extends Omit<LoanFilters, "state"> {
  lender?: string;
  amount?: string;
  duration?: string;
  basisPoints?: number;
}

export const getGroupedLoanOffersCacheKey = (filters?: LoanOfferFilters) => [
  "loan_offers",
  "grouped",
  filters,
];

export function fetchGroupedLoanOffers(
  filters: LoanOfferFilters = {}
): Promise<GroupedLoanOfferJson[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_HOST}/api/loans/offers/grouped`
  );
  appendQueryParams(url, filters);

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

export const getLoanOffersCacheKey = (filters?: LoanOfferFilters) => [
  "loan_offers",
  filters,
];

export function fetchLoanOffers({
  lender,
  amount,
  duration,
  basisPoints,
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

  if (amount) {
    url.searchParams.append("amount", amount.toString());
  }

  if (duration) {
    url.searchParams.append("duration", duration.toString());
  }

  if (basisPoints) {
    url.searchParams.append("basisPoints", basisPoints.toString());
  }

  return fetch(url).then((res) => res.json());
}

export function useLoanOffersQuery(filters: LoanOfferFilters = {}) {
  return useQuery(
    getLoanOffersCacheKey(filters),
    () => fetchLoanOffers(filters),
    {
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
