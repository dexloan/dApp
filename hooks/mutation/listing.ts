import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import { ListingResult, ListingState } from "../../common/types";
import { listing, getOrCreateTokenAccount } from "../../common/actions";
import {
  getBorrowingsQueryKey,
  getListingQueryKey,
  getListingsQueryKey,
  getPersonalLoansQueryKey,
} from "../query/listing";
import { findLoanAddress } from "../../common/query/loan";

interface CancelMutationProps {
  mint: anchor.web3.PublicKey;
}

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

        return listing.cancelListing(
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
        queryClient.setQueryData(
          getListingsQueryKey(),
          (listings: ListingResult[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) => item.data.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        queryClient.setQueryData(
          getBorrowingsQueryKey(anchorWallet?.publicKey),
          (listings: ListingResult[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) => item.data.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setListingState(queryClient, variables.mint, ListingState.Cancelled);

        toast.success("Listing cancelled");

        onSuccess();
      },
    }
  );
};

function setListingState(
  queryClient: QueryClient,
  listing: anchor.web3.PublicKey,
  state: ListingState
) {
  queryClient.setQueryData<ListingResult | undefined>(
    getListingQueryKey(listing),
    (item) => {
      if (item) {
        return {
          ...item,
          data: {
            ...item.data,
            state,
          },
        };
      }
    }
  );
}
