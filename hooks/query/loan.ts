import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";
import bs58 from "bs58";

import * as query from "../../common/query";

export const useLoanAddressQuery = (
  mint?: anchor.web3.PublicKey,
  borrower?: anchor.web3.PublicKey
) => {
  return useQuery(
    ["loan_address", mint?.toBase58(), borrower?.toBase58()],
    () => {
      if (mint && borrower) {
        return query.findLoanAddress(mint, borrower);
      }
    },
    { enabled: Boolean(mint && borrower) }
  );
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

export const getLoansQueryKey = (state: number) => ["loans", state];

export function useLoansQuery(state: number) {
  const { connection } = useConnection();

  return useQuery(
    getLoansQueryKey(state),
    () =>
      query.fetchMultipleLoans(connection, [
        {
          memcmp: {
            // filter listed
            offset: 8,
            bytes: bs58.encode([state]),
          },
        },
      ]),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getLoanOffersCacheKey = () => ["loan_offers"];

export function useLoanOffersQuery() {
  const { connection } = useConnection();

  return useQuery(
    getLoanOffersCacheKey(),
    () => query.fetchMultipleLoanOffers(connection, []),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export function useLoanOffersByLenderQuery(
  lender?: anchor.web3.PublicKey | null
) {
  const { connection } = useConnection();

  return useQuery(
    getLoanOffersCacheKey(),
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
