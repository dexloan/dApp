import { web3 } from "@project-serum/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "react-query";

import * as query from "../../common/query";

export const useCollectionsQuery = () => {
  const { connection } = useConnection();

  return useQuery(
    ["collections"],
    () => {
      return query.fetchMultipleCollections(connection);
    },
    {
      enabled: typeof window !== "undefined",
    }
  );
};

export const useCollectionByMintQuery = (mint?: web3.PublicKey) => {
  const { connection } = useConnection();

  return useQuery(
    ["collection", mint?.toBase58()],
    async () => {
      if (mint) {
        const collectionPda = await query.findCollectionAddress(mint);
        return query.fetchCollection(connection, collectionPda);
      }
    },
    {
      enabled: typeof window !== "undefined" && Boolean(mint),
    }
  );
};
