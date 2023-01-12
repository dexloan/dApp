import * as anchor from "@project-serum/anchor";
import { Box, Tr, Td, Text, Tooltip } from "@chakra-ui/react";
import { Loan } from "@prisma/client";
import { useState, useCallback, useMemo } from "react";

import * as utils from "../../../common/utils";
import { LoanOfferPretty, LoanPretty } from "../../../common/model";
import { useFloorPricesQuery } from "../../../hooks/query";
import { NFTCellNew } from "../../table";
import { FloorPrice } from "../../floorPrice";
import { LoanJson } from "../../../common/types";

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
  offers: LoanOfferPretty[][] = [],
  state: LoanSortState
): LoanOfferPretty[][] => {
  const floorPriceQueries = useFloorPricesQuery();

  return useMemo(() => {
    const [sortCol, direction] = state;
    const sortFn = compareBy(sortCol, direction, floorPriceQueries.data);
    return offers.sort(([a], [b]) => sortFn(a, b));
  }, [offers, state, floorPriceQueries.data]);
};

export const useSortedLoans = (
  offers: LoanPretty[] = [],
  state: LoanSortState
) => {
  const floorPriceQueries = useFloorPricesQuery();

  return useMemo(() => {
    const [sortCol, direction] = state;

    return offers.sort(compareBy(sortCol, direction, floorPriceQueries.data));
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
  return (...args: LoanPretty[] | LoanOfferPretty[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (args[0].data.amount) {
      if (args[1].data.amount) {
        return args[0].data.amount - args[1].data.amount;
      }
      return 1;
    }
    return -1;
  };
}

function sortByBasisPoints(direction: number) {
  return (...args: LoanPretty[] | LoanOfferPretty[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.basisPoints - args[1].data.basisPoints;
  };
}

function sortByLTV(direction: number, floorPrices?: Record<string, number>) {
  return (...args: LoanPretty[] | LoanOfferPretty[]) => {
    if (direction === -1) {
      args.reverse();
    }

    if (!floorPrices) {
      return -1;
    }

    const metadataA =
      "metadata" in args[0] ? args[0].metadata : args[0].collection.metadata;
    const metadataB =
      "metadata" in args[1] ? args[1].metadata : args[1].collection.metadata;

    const floorPriceA = utils.getFloorPrice(floorPrices, metadataA.data.symbol);
    const floorPriceB = utils.getFloorPrice(floorPrices, metadataB.data.symbol);
    const amountA = args[0].data.amount;
    const amountB = args[1].data.amount;

    if (floorPriceA && floorPriceB && amountA && amountB) {
      const ltvA = Number((amountA / floorPriceA) * 100);
      const ltvB = Number((amountB / floorPriceB) * 100);

      return ltvA - ltvB;
    }

    return -1;
  };
}

function sortByDuration(direction: number) {
  return (...args: LoanPretty[] | LoanOfferPretty[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.duration - args[1].data.duration;
  };
}

interface LoanRowProps {
  loan: LoanJson;
  subtitle?: string;
  onClick: () => void;
}

export const LoanRow = ({ loan, subtitle, onClick }: LoanRowProps) => {
  const floorPrice = loan.Collection.floorPrice;

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCellNew subtitle={subtitle} mint={loan.mint} />
      <Td>{loan.duration}</Td>
      <Td isNumeric>
        <Text mb="1">
          {utils.basisPointsToPercent(
            loan.basisPoints + loan.creatorBasisPoints
          )}
        </Text>
        <Tooltip label="Lender and creator interest rates.">
          <Text fontSize="xs" color="gray.500">
            ({utils.basisPointsToPercent(loan.basisPoints)},{" "}
            {utils.basisPointsToPercent(loan.creatorBasisPoints)})
          </Text>
        </Tooltip>
      </Td>
      <Td isNumeric>{getLTV(floorPrice, loan.amount)}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">
            {loan.amount ? utils.formatHexAmount(loan.amount) : null}
          </Text>
          <FloorPrice>{utils.formatHexAmount(floorPrice)}</FloorPrice>
        </Box>
      </Td>
    </Tr>
  );
};

function getLTV(floorPrice: string, amount: string | null) {
  if (amount) {
    try {
      return (
        (
          (utils.hexToNumber(amount) / utils.hexToNumber(floorPrice)) *
          100
        ).toFixed(2) + "%"
      );
    } catch (err) {
      console.error(err);
    }
  }
}
