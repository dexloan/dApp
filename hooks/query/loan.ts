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

export interface LoanFilters {
  state?: LoanState;
  amount?: string;
  duration?: string;
  basisPoints?: number;
  lender?: string;
  borrower?: string;
  collections?: string[];
  orderBy?: LoanSortCols;
  sortOrder?: "asc" | "desc";
}

export interface LoanOfferFilters
  extends Omit<LoanFilters, "state" | "borrower"> {}

function mapLoanColToPrismaCol(col: LoanSortCols) {
  return {
    asset: "collectionAddress",
    collection: "collectionAddress",
    ltv: undefined,
    amount: "amount",
    apy: "basisPoints",
    duration: "duration",
  }[col];
}

function appendQueryParams(url: URL, params: LoanFilters) {
  if (params.state) {
    url.searchParams.append("state", params.state);
  }

  if (params.amount) {
    url.searchParams.append("amount", params.amount);
  }

  if (params.duration) {
    url.searchParams.append("duration", params.duration);
  }

  if (params.basisPoints) {
    url.searchParams.append("basisPoints", params.basisPoints.toString());
  }

  if (params.lender) {
    url.searchParams.append("lender", params.lender);
  }

  if (params.borrower) {
    url.searchParams.append("borrower", params.borrower);
  }

  if (params.collections instanceof Array) {
    params.collections.forEach((address) =>
      url.searchParams.append("collectionAddress", address)
    );
  }

  if (params.orderBy) {
    const prismaCol = mapLoanColToPrismaCol(params.orderBy);

    if (prismaCol) {
      url.searchParams.append("orderBy", prismaCol);
    }
  }

  if (params.sortOrder) {
    url.searchParams.append("sortOrder", params.sortOrder);
  }
}

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

export function fetchLoan(address: string): Promise<LoanJson> {
  return fetch(`${process.env.NEXT_PUBLIC_HOST}/api/loan/item/${address}`).then(
    (res) => res.json()
  );
}

export function useLoanQuery(loanPda?: string) {
  return useQuery(
    ["loan", loanPda],
    () => {
      if (loanPda) return fetchLoan(loanPda);
    },
    { enabled: Boolean(loanPda) }
  );
}

export function fetchLoans(filters: LoanFilters): Promise<LoanJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loan/asks`);

  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useLoansQuery(filters: LoanFilters = {}) {
  return useQuery(["loans", filters], () => fetchLoans(filters), {
    refetchOnWindowFocus: false,
  });
}

export function fetchGroupedLoanOffers(
  filters: LoanOfferFilters
): Promise<GroupedLoanOfferJson[]> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_HOST}/api/loan/offers/grouped`
  );
  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useGroupedLoanOffersQuery(filters: LoanOfferFilters = {}) {
  return useQuery(
    ["loan_offers", "grouped", filters],
    () => fetchGroupedLoanOffers(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export function fetchLoanOffers(
  filters: LoanOfferFilters
): Promise<LoanOfferJson[]> {
  const url = new URL(`${process.env.NEXT_PUBLIC_HOST}/api/loan/offers`);

  appendQueryParams(url, filters);

  return fetch(url).then((res) => res.json());
}

export function useLoanOffersQuery(filters: LoanOfferFilters = {}) {
  return useQuery(
    ["loan_offers", "all", filters],
    () => fetchLoanOffers(filters),
    {
      refetchOnWindowFocus: false,
    }
  );
}
