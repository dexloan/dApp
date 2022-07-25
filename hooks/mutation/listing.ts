import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import { ListingState } from "../../common/types";
import {
  getListingQueryKey,
  getListingsQueryKey,
  getPersonalListingsQueryKey,
} from "../query";

interface CloseListingProps {
  mint: anchor.web3.PublicKey;
}

export const useCloseListingMutation = (onSuccess: () => void) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseListingProps>(
    async ({ mint }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.cancelListing(
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
          (listings: any[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) => item.data.mint !== variables.mint.toBase58()
            );
          }
        );

        queryClient.setQueryData(
          getPersonalListingsQueryKey(anchorWallet?.publicKey),
          (listings: any[] | undefined) => {
            if (!listings) return [];

            return listings.filter(
              (item) => item.data.mint !== variables.mint.toBase58()
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
  queryClient.setQueryData<any | undefined>(
    getListingQueryKey(listing),
    (item: any) => {
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
