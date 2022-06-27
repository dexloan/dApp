import * as anchor from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import { loan } from "../../common/query";

export const getLoanQueryKey = (
  loanAddress: anchor.web3.PublicKey | undefined
) => ["loan", loanAddress?.toBase58()];

export function useLoanQuery(
  connection: anchor.web3.Connection,
  loanAddress: anchor.web3.PublicKey | undefined
) {
  return useQuery(
    getLoanQueryKey(loanAddress),
    () => {
      if (loanAddress) return loan.fetchLoan(connection, loanAddress);
    },
    { enabled: Boolean(loanAddress) }
  );
}

export const getLoansQueryKey = () => ["loans"];

export function useLoansQuery(connection: anchor.web3.Connection) {
  return useQuery(
    getLoansQueryKey(),
    () => loan.fetchMultipleLoans(connection),
    {
      refetchOnWindowFocus: false,
    }
  );
}

export const getBorrowingsQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans", walletAddress?.toBase58()];

export function useBorrowingsQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getBorrowingsQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return loan.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter borrower
              offset: 8 + 8 + 1,
              bytes: wallet.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(wallet),
      refetchOnWindowFocus: false,
    }
  );
}

export const getPersonalLoansQueryKey = (
  walletAddress: anchor.web3.PublicKey | undefined
) => ["loans", walletAddress?.toBase58()];

export function usePersonalLoansQuery(
  connection: anchor.web3.Connection,
  wallet?: AnchorWallet
) {
  return useQuery(
    getPersonalLoansQueryKey(wallet?.publicKey),
    () => {
      if (wallet) {
        return loan.fetchMultipleLoans(connection, [
          {
            memcmp: {
              // filter lender
              offset: 8 + 8 + 32 + 1,
              bytes: wallet?.publicKey.toBase58(),
            },
          },
        ]);
      }
    },
    {
      enabled: Boolean(wallet?.publicKey),
      refetchOnWindowFocus: false,
    }
  );
}
