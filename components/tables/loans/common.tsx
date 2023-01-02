import * as anchor from "@project-serum/anchor";
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
import { useFloorPrice, useLTV } from "../../../hooks/render";
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
  loan: Loan | LoanOffer;
  subtitle?: string;
  onClick: () => void;
}

export const LoanRow = ({ loan, subtitle, onClick }: LoanRowProps) => {
  const floorPrice = useFloorPrice(loan.metadata.data.symbol);
  const floorPriceSol = useMemo(() => {
    if (floorPrice) {
      return floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPrice]);

  const ltv = useLTV(loan?.data.amount, floorPrice);

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCell subtitle={subtitle} metadata={loan.metadata} />
      <Td>{loan.duration}</Td>
      <Td isNumeric>
        <Text mb="1">{loan.apy}</Text>
        <Tooltip label="Lender and creator interest rates.">
          <Text fontSize="xs" color="gray.500">
            ({loan.lenderApy}, {loan.creatorApy})
          </Text>
        </Tooltip>
      </Td>
      <Td isNumeric>{ltv}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">{loan.amount}</Text>
          <FloorPrice>{floorPriceSol}</FloorPrice>
        </Box>
      </Td>
    </Tr>
  );
};
