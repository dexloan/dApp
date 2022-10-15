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
