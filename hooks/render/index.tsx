import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { useMemo } from "react";

import * as utils from "../../common/utils";
import { EllipsisProgress } from "../../components/progress";
import { useFloorPricesQuery, useMetadataQuery } from "../query";

export const useFloorPrice = (symbol?: string): number | undefined => {
  const formattedSymbol = useMemo(() => {
    if (symbol) {
      return utils.trimNullChars(symbol).toLowerCase();
    }
  }, [symbol]);

  const floorPricesQuery = useFloorPricesQuery();

  if (formattedSymbol) {
    return floorPricesQuery.data?.[formattedSymbol];
  }
};

export function useLTV(amount?: anchor.BN | null, floorPrice?: number) {
  return useMemo(() => {
    if (amount && floorPrice) {
      const percentage = Number((amount.toNumber() / floorPrice) * 100).toFixed(
        2
      );
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }, [amount, floorPrice]);
}

export function useCollectionName(metadata?: Metadata) {
  const query = useMetadataQuery(metadata?.collection?.key);
  return query.data?.data.name ?? null;
}
