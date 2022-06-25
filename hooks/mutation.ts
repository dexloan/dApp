import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import { ListingResult, ListingState } from "../common/types";
import {
  cancelListing,
  closeAccount,
  giveLoan,
  getOrCreateTokenAccount,
  repayLoan,
  repossessCollateral,
} from "../common/actions";
import {
  getBorrowingsQueryKey,
  getListingQueryKey,
  getListingsQueryKey,
  getLoansQueryKey,
} from "./query";

interface RepossessMutationProps {
  mint: anchor.web3.PublicKey;
}

export const useRepossessMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepossessMutationProps>(
    async ({ mint }) => {
      if (anchorWallet && wallet.publicKey) {
        const lenderTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return repossessCollateral(
          connection,
          anchorWallet,
          mint,
          lenderTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      onSuccess(_, variables) {
        toast.success("NFT repossessed.");

        queryClient.setQueryData(
          getLoansQueryKey(anchorWallet?.publicKey),
          (loans: ListingResult[] | undefined) => {
            if (!loans) return [];

            return loans.filter(
              (loan) =>
                loan.listing.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setListingState(queryClient, variables.mint, ListingState.Defaulted);

        onSuccess();
      },
    }
  );
};

interface RepaymentMutationProps extends RepossessMutationProps {
  lender: anchor.web3.PublicKey;
}

export const useRepaymentMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, RepaymentMutationProps>(
    async ({ mint, lender }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return repayLoan(
          connection,
          anchorWallet,
          mint,
          lender,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      onSuccess(_, variables) {
        toast.success("Loan repaid. Your NFT has been returned to you.");

        queryClient.setQueryData(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (borrowings: ListingResult[] | undefined) => {
            if (!borrowings) return [];

            return borrowings.filter(
              (borrowing) =>
                borrowing.listing.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setListingState(queryClient, variables.mint, ListingState.Repaid);

        onSuccess();
      },
    }
  );
};

interface CancelMutationProps extends RepossessMutationProps {}

export const useCancelMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CancelMutationProps>(
    async ({ mint }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return cancelListing(
          connection,
          anchorWallet,
          mint,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      onSuccess(_, variables) {
        toast.success("Listing cancelled");

        queryClient.setQueryData(
          getListingsQueryKey(),
          (listings: ListingResult[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) =>
                item.listing.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        queryClient.setQueryData(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (listings: ListingResult[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) =>
                item.listing.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setListingState(queryClient, variables.mint, ListingState.Cancelled);

        onSuccess();
      },
    }
  );
};

interface LoanMutationProps {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
  listing: anchor.web3.PublicKey;
}

export const useLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, LoanMutationProps>(
    async ({ mint, borrower, listing }) => {
      if (anchorWallet) {
        return giveLoan(connection, anchorWallet, mint, borrower);
      }
      throw new Error("Not ready");
    },
    {
      onSuccess(_, variables) {
        toast.success("Loan created");

        queryClient.setQueryData<ListingResult[] | undefined>(
          getListingsQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.publicKey.toBase58() !== variables.listing.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getLoansQueryKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<ListingResult | undefined>(
          getListingQueryKey(variables.listing),
          (data) => {
            if (data) {
              return {
                ...data,
                listing: {
                  ...data.listing,
                  state: ListingState.Active,
                  startDate: new anchor.BN(Date.now() / 1000),
                },
              };
            }
          }
        );

        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

interface CloseMutationVariables {
  listing: anchor.web3.PublicKey;
}

export const useCloseLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseMutationVariables>(
    async ({ listing }) => {
      if (anchorWallet) {
        return closeLoan(connection, anchorWallet, listing);
      }
      throw new Error("Not ready");
    },
    {
      onSuccess(_, variables) {
        toast.success("Loan closed");

        queryClient.setQueryData<ListingResult[] | undefined>(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.publicKey.toBase58() !== variables.listing.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<ListingResult[] | undefined>(
          getListingsQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.publicKey.toBase58() !== variables.listing.toBase58()
              );
            }
          }
        );

        onSuccess();
      },
      onError(err) {
        console.error(err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
    }
  );
};

function setListingState(
  queryClient: QueryClient,
  mint: anchor.web3.PublicKey,
  state: ListingState
) {
  queryClient.setQueryData<ListingResult | undefined>(
    getListingQueryKey(mint),
    (data) => {
      if (data) {
        return {
          ...data,
          listing: {
            ...data.listing,
            state,
          },
        };
      }
    }
  );
}
