import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import * as anchor from "@project-serum/anchor";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { QueryClient, useMutation, useQueryClient } from "react-query";
import toast from "react-hot-toast";
import { CallOptionState } from "@prisma/client";

import * as actions from "../../common/actions";
import * as query from "../../common/query";
import {
  CallOptionJson,
  CallOptionBidJson,
  CallOptionStateEnum,
  NftResult,
} from "../../common/types";
import { fetchCallOptionBids } from "../query";

export interface BidCallOptionMutationVariables {
  collection: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    count: number;
    amount: number;
    strikePrice: number;
    expiry: number;
  };
}

function pickOfferIds(offers: CallOptionBidJson[], count: number) {
  const ids = [];
  const existingIds = offers.map((offer) => offer.bidId);

  let id = 0;
  while (ids.length < count && id <= 255) {
    if (!existingIds.includes(id)) {
      ids.push(id);
    }
    id++;
  }

  return ids;
}

export const useBidCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    async (variables: BidCallOptionMutationVariables) => {
      if (anchorWallet) {
        const currentOffers = await fetchCallOptionBids({
          buyer: anchorWallet.publicKey.toBase58(),
          collections: [variables.collection.toBase58()],
        });
        const ids = pickOfferIds(currentOffers, variables.options.count);
        console.log("current offers: ", currentOffers);
        console.log("next offers: ", ids);

        return actions.bidCallOption(
          connection,
          anchorWallet,
          variables.collection,
          variables.collectionMint,
          variables.options,
          ids
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
      async onSuccess() {
        await queryClient.invalidateQueries(["call_option_bids"]);
        toast.success("Call option bid(s) created");
        onSuccess();
      },
    }
  );
};

interface SellCallOptionMutation {
  mint: anchor.web3.PublicKey;
  bid: CallOptionBidJson;
}

export const useSellCallOptionMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, SellCallOptionMutation>(
    async (variables) => {
      if (anchorWallet) {
        return actions.sellCallOption(
          connection,
          anchorWallet,
          variables.mint,
          variables.bid
        );
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess() {
        await queryClient.invalidateQueries(["call_option_bids"]);
        toast.success("Loan taken");
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

export const useCloseCallOptionBidMutation = (onSuccess: () => void) => {
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const queryClient = useQueryClient();

  return useMutation<void, Error, CallOptionBidJson>(
    async (variables) => {
      if (anchorWallet) {
        return actions.closeBid(connection, anchorWallet, variables);
      }
      throw new Error("Not ready");
    },
    {
      async onSuccess(_, variables) {
        await queryClient.invalidateQueries(["call_option_bids"]);
        toast.success("Call option bid closed");
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

export interface AskCallOptionMutationVariables {
  mint: anchor.web3.PublicKey;
  collectionMint: anchor.web3.PublicKey;
  options: {
    amount: number;
    strikePrice: number;
    expiry: number;
  };
}

export const useAskCallOptionMutation = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation(
    (variables: AskCallOptionMutationVariables) => {
      if (anchorWallet) {
        return actions.askCallOption(
          connection,
          anchorWallet,
          variables.mint,
          variables.collectionMint,
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
      async onSuccess() {
        await queryClient.invalidateQueries(["call_options"]);
        toast.success("Call Option Ask created");
        onSuccess();
      },
    }
  );
};

interface CloseCallOptionVariables {
  mint: anchor.web3.PublicKey;
  seller: anchor.web3.PublicKey;
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
      async onSuccess(_, variables) {
        const callOptionPda = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );
        await queryClient.invalidateQueries(["call_option", callOptionPda]);
        await queryClient.invalidateQueries(["call_options"]);
        toast.success("Call Option closed");
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
        const callOptionPda = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );
        await queryClient.invalidateQueries(["call_option", callOptionPda]);
        await queryClient.invalidateQueries(["call_options"]);
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
      async onSuccess(_, variables) {
        const callOptionPda = await query.findCallOptionAddress(
          variables.mint,
          variables.seller
        );
        await queryClient.invalidateQueries(["call_option", callOptionPda]);
        await queryClient.invalidateQueries(["call_options"]);
        toast.success("Option exercised");
        onSuccess();
      },
    }
  );
};
