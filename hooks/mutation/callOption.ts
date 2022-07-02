import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import { NFTResult, CallOptionResult } from "../../common/types";
import { CallOptionState } from "../../common/constants";
import { findCallOptionAddress } from "../../common/query/callOption";
import {
  getCallOptionQueryKey,
  getCallOptionsQueryKey,
  getBuyerCallOptionsQueryKey,
  getSellerCallOptionsQueryKey,
} from "../query/callOption";

interface InitCallOptionMutationVariables {
  mint: anchor.web3.PublicKey;
  depositTokenAccount: anchor.web3.PublicKey;
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  };
}

export const useInitCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: InitCallOptionMutationVariables) => {
      if (anchorWallet) {
        return actions.initCallOption(
          connection,
          anchorWallet,
          variables.mint,
          variables.depositTokenAccount,
          variables.options
        );
      }
      throw new Error("Not ready");
    },
    {
      onError(err) {
        console.error("Error: " + err);
        if (err instanceof Error) {
          toast.error("Error: " + err.message);
        }
      },
      onSuccess(_, variables) {
        queryClient.setQueryData<NFTResult[]>(
          ["wallet-nfts", anchorWallet?.publicKey.toBase58()],
          (data) => {
            if (!data) {
              return [];
            }
            return data.filter(
              (item: NFTResult) =>
                item?.tokenAccount.pubkey !== variables.depositTokenAccount
            );
          }
        );

        toast.success("Listing created");

        onSuccess();
      },
    }
  );
};

interface CloseCallOptionVariables {
  mint: anchor.web3.PublicKey;
}

export const useCloseCallOptionMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CloseCallOptionVariables>(
    async ({ mint }) => {
      if (anchorWallet) {
        const borrowerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.closeCallOption(
          connection,
          anchorWallet,
          mint,
          borrowerTokenAccount
        );
      }
      throw new Error("Not ready");
    },
    {
      onSuccess(_, variables) {
        queryClient.setQueryData<CallOptionResult[] | undefined>(
          getSellerCallOptionsQueryKey(anchorWallet?.publicKey),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.setQueryData<CallOptionResult[] | undefined>(
          getCallOptionsQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

        toast.success("Call option closed");

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

interface BuyCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
}

export const useBuyCallOptionMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, BuyCallOptionVariables>(
    async ({ mint, seller }) => {
      if (anchorWallet) {
        return actions.buyCallOption(connection, anchorWallet, mint, seller);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const callOptionAddress = await findCallOptionAddress(
          variables.mint,
          variables.seller
        );

        queryClient.setQueryData<CallOptionResult[] | undefined>(
          getCallOptionsQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) =>
                  item.data.mint.toBase58() !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getBuyerCallOptionsQueryKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<CallOptionResult | undefined>(
          getCallOptionQueryKey(callOptionAddress),
          (item) => {
            if (item) {
              return {
                ...item,
                listing: {
                  ...item.data,
                  state: CallOptionState.Active,
                  buyer: anchorWallet?.publicKey,
                },
              };
            }
          }
        );

        toast.success("Call option bought");

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

interface ExerciseCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
}

export const useExerciseCallOptionMutation = (onSuccess: () => void) => {
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, ExerciseCallOptionVariables>(
    async ({ mint, seller }) => {
      if (anchorWallet && wallet.publicKey) {
        const buyerTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.exerciseCallOption(
          connection,
          anchorWallet,
          mint,
          buyerTokenAccount,
          seller
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
          getBuyerCallOptionsQueryKey(anchorWallet?.publicKey),
          (items: CallOptionResult[] | undefined) => {
            if (!items) return [];

            return items.filter(
              (item) => item.data.mint.toBase58() !== variables.mint.toBase58()
            );
          }
        );

        setCallOptionState(
          queryClient,
          variables.mint,
          CallOptionState.Exercised
        );

        toast.success("Option exercised");

        onSuccess();
      },
    }
  );
};

function setCallOptionState(
  queryClient: QueryClient,
  callOption: anchor.web3.PublicKey,
  state: typeof CallOptionState[keyof typeof CallOptionState]
) {
  queryClient.setQueryData<CallOptionResult | undefined>(
    getCallOptionQueryKey(callOption),
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