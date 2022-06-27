import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";

import { NFTResult, CallOptionResult } from "../../common/types";
import { CallOptionState } from "../../common/constants";
import { callOption } from "../../common/actions";
import { findCallOptionAddress } from "../../common/query/callOption";
import { getCallOptionQueryKey } from "../query/callOption";

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
        return callOption.initCallOption(
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

interface BuyCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
}

export const useGiveLoanMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, BuyCallOptionVariables>(
    async ({ mint, seller }) => {
      if (anchorWallet) {
        return callOption.buyCallOption(connection, anchorWallet, mint, seller);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        const loanAddress = await findCallOptionAddress(
          variables.mint,
          variables.borrower
        );

        queryClient.setQueryData<LoanResult[] | undefined>(
          getLoansQueryKey(),
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
          getPersonalLoansQueryKey(anchorWallet?.publicKey)
        );

        queryClient.setQueryData<LoanResult | undefined>(
          getLoanQueryKey(loanAddress),
          (item) => {
            if (item) {
              return {
                ...item,
                listing: {
                  ...item.data,
                  state: LoanState.Active,
                  startDate: new anchor.BN(Date.now() / 1000),
                },
              };
            }
          }
        );

        toast.success("Loan created");

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
