import * as anchor from "@project-serum/anchor";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import * as query from "../../common/query";

export const getLoanQueryKey = (
  loanAddress: anchor.web3.PublicKey | undefined
) => ["loan", loanAddress?.toBase58()];

export function useLoanQuery(loanAddress: anchor.web3.PublicKey | undefined) {
  const { connection } = useConnection();

  return useQuery(
    getLoanQueryKey(loanAddress),
    () => {
      if (loanAddress) return query.fetchLoan(connection, loanAddress);
    },
    { enabled: Boolean(loanAddress) }
  );
}

export const getLoansQueryKey = () => ["loans"];

export function useLoansQuery() {
  const { connection } = useConnection();

  return useQuery(
    getLoansQueryKey(),
    () => query.fetchMultipleLoans(connection),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getBorrowingsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["borrowings", walletAddress?.toBase58()];

export function useBorrowingsQuery() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getBorrowingsQueryKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter borrower
              offset: 8 + 1 + 8,
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

export const getPersonalLoansQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans", walletAddress?.toBase58()];

export function usePersonalLoansQuery() {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useQuery(
    getPersonalLoansQueryKey(anchorWallet?.publicKey),
    () => {
      if (anchorWallet) {
        return query.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter lender
              offset: 8 + 1 + 32 + 1,
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
