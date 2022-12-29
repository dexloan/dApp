import { useState, useCallback, useMemo } from "react";
import { Box, Tr, Td, Text, Tooltip } from "@chakra-ui/react";

import * as utils from "../../../common/utils";
import {
  Loan,
  LoanOffer,
  LoanOfferPretty,
  LoanPretty,
} from "../../../common/model";
import { useFloorPricesQuery } from "../../../hooks/query";
import { NftResult } from "../../../common/types";
import { NFTCell } from "../../table";
import { FloorPrice } from "../../floorPrice";

export type LoanSortCols =
  | "asset"
  | "collection"
  | "duration"
  | "ltv"
  | "apy"
  | "amount";
export type LoanSortState = [LoanSortCols, number];
export type LoanSortFn = (col: LoanSortCols) => void;

export const useLoanSortState = (): [LoanSortState, LoanSortFn] => {
  const [state, setState] = useState<LoanSortState>(["amount", 1]);

  const onSort = useCallback((col) => setState(sortReducer(col)), []);

  return [state, onSort];
};

export const useSortedLoanOffers = (
  offers: LoanOfferPretty[] = [],
  state: LoanSortState
) => {
  const floorPriceQueries = useFloorPricesQuery();

  return useMemo(() => {
    const [sortCol, direction] = state;

    return offers
      .map(LoanOffer.fromJSON)
      .sort(compareBy(sortCol, direction, floorPriceQueries.data));
  }, [offers, state, floorPriceQueries.data]);
};

export const useSortedLoans = (
  offers: LoanPretty[] = [],
  state: LoanSortState
) => {
  const floorPriceQueries = useFloorPricesQuery();

  return useMemo(() => {
    const [sortCol, direction] = state;

    return offers
      .map(Loan.fromJSON)
      .sort(compareBy(sortCol, direction, floorPriceQueries.data));
  }, [offers, state, floorPriceQueries.data]);
};

function sortReducer(col: LoanSortCols) {
  return (state: LoanSortState): LoanSortState => {
    if (state[0] === col) {
      return [state[0], state[1] * -1];
    }
    return [col, 1];
  };
}

export function compareBy(
  sortCol: LoanSortCols,
  direction: number,
  floorPrices?: Record<string, number>
) {
  switch (sortCol) {
    case "duration": {
      return sortByDuration(direction);
    }

    case "ltv": {
      // TODO
      return sortByLTV(direction, floorPrices);
    }

    case "apy":
      return sortByBasisPoints(direction);

    case "amount":
      return sortByAmount(direction);

    default: {
      return () => {
        return 1;
      };
    }
  }
}

function sortByAmount(direction: number) {
  return (...args: Loan[] | LoanOffer[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (args[0].data.amount) {
      if (args[1].data.amount) {
        return args[0].data.amount.sub(args[1].data.amount).toNumber();
      }
      return 1;
    }
    return -1;
  };
}

function sortByBasisPoints(direction: number) {
  return (...args: Loan[] | LoanOffer[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.basisPoints - args[1].data.basisPoints;
  };
}

function sortByLTV(direction: number, floorPrices?: Record<string, number>) {
  return (...args: Loan[] | LoanOffer[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (!floorPrices) {
      return -1;
    }

    const floorPriceA = utils.getFloorPrice(
      floorPrices,
      args[0]?.metadata.data.symbol
    );
    const floorPriceB = utils.getFloorPrice(
      floorPrices,
      args[1]?.metadata.data.symbol
    );
    const amountA = args[0].data.amount;
    const amountB = args[1].data.amount;

    if (floorPriceA && floorPriceB && amountA && amountB) {
      const ltvA = Number((amountA.toNumber() / floorPriceA) * 100);
      const ltvB = Number((amountB.toNumber() / floorPriceB) * 100);

      return ltvA - ltvB;
    }

    return -1;
  };
}

function sortByDuration(direction: number) {
  return (...args: Loan[] | LoanOffer[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.duration.sub(args[1].data.duration).toNumber();
  };
}

interface LoanRowProps {
  amount?: string;
  duration: string;
  apy: string;
  creatorApy: string;
  lenderApy: string;
  floorPriceSol?: number;
  ltv: React.ReactNode;
  metadata: NftResult["metadata"];
  onClick: () => void;
}

export const LoanRow = ({
  amount,
  duration,
  apy,
  creatorApy,
  lenderApy,
  floorPriceSol,
  ltv,
  metadata,
  onClick,
}: LoanRowProps) => {
  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCell metadata={metadata} />
      <Td>{duration}</Td>
      <Td isNumeric>
        <Text mb="1">{apy}</Text>
        <Tooltip label="Lender and creator interest rates.">
          <Text fontSize="xs" color="gray.500">
            ({lenderApy}, {creatorApy})
          </Text>
        </Tooltip>
      </Td>
      <Td isNumeric>{ltv}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">{amount}</Text>
          <FloorPrice>{floorPriceSol}</FloorPrice>
        </Box>
      </Td>
    </Tr>
  );
};
