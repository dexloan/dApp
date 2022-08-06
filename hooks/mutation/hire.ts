import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import * as actions from "../../common/actions";
import { HireStateEnum, NFTResult } from "../../common/types";
import { CallOptionPretty } from "../../common/model";
import { findHireAddress } from "../../common/query";
import { HirePretty } from "../../common/model/hire";
import {
  getHireQueryKey,
  getHiresQueryKey,
  getLenderHiresQueryKey,
  getBorrowerHiresQueryKey,
} from "../query/hire";

interface InitHireMutationVariables {
  mint: anchor.web3.PublicKey;
  depositTokenAccount: anchor.web3.PublicKey;
  options: {
    amount: number;
    expiry: number;
    borrower?: anchor.web3.PublicKey;
  };
}

export const useInitHireMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: InitHireMutationVariables) => {
      if (anchorWallet) {
        return actions.initHire(
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
                !item?.tokenAccount.pubkey.equals(variables.depositTokenAccount)
            );
          }
        );

        toast.success("Listing created");

        onSuccess();
      },
    }
  );
};

interface TakeHireVariables {
  mint: anchor.web3.PublicKey;
  lender: anchor.web3.PublicKey;
  metadata: Metadata;
  days: number;
}

export const useTakeHireMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const wallet = useWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, TakeHireVariables>(
    async ({ mint, lender, metadata, days }) => {
      if (anchorWallet && wallet.publicKey) {
        const hireTokenAccount = await actions.getOrCreateTokenAccount(
          connection,
          wallet,
          mint
        );

        return actions.takeHire(
          connection,
          anchorWallet,
          mint,
          lender,
          hireTokenAccount,
          metadata,
          days
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const hireAddress = await findHireAddress(
          variables.mint,
          variables.lender
        );

        queryClient.setQueryData<HirePretty[] | undefined>(
          getHiresQueryKey(),
          (data) => {
            if (data) {
              return data?.filter(
                (item) => item.data.mint !== variables.mint.toBase58()
              );
            }
          }
        );

        queryClient.invalidateQueries(
          getBorrowerHiresQueryKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<HirePretty | undefined>(
          getHireQueryKey(hireAddress),
          (item) => {
            if (item && anchorWallet) {
              return {
                ...item,
                data: {
                  ...item.data,
                  state: HireStateEnum.Hired,
                  buyer: anchorWallet.publicKey.toBase58(),
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
