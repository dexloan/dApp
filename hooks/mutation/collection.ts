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

interface InitCollectionVariables {
  mint: anchor.web3.PublicKey;
}

export const useInitCollectionMutation = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  return useMutation<void, Error, InitCollectionVariables>((variables) => {
    if (anchorWallet) {
      return actions.initCollection(connection, anchorWallet, variables.mint);
    }
    throw new Error("Not ready");
  });
};
