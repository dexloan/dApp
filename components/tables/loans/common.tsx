import { Box, Tr, Td, Text, Tooltip } from "@chakra-ui/react";
import { useState, useCallback } from "react";

import * as utils from "../../../common/utils";
import {
  LoanJson,
  LoanOfferJson,
  GroupedLoanOfferJson,
} from "../../../common/types";
import { SortDirection } from "../../../common/types";
import { NFTCellNew } from "../../table";
import { FloorPrice } from "../../floorPrice";

export type LoanSortCols =
  | "asset"
  | "collection"
  | "duration"
  | "ltv"
  | "apy"
  | "amount";
export type LoanSortState = [LoanSortCols, SortDirection];
export type LoanSortFn = (col: LoanSortCols) => void;

export const useLoanSortState = (): [LoanSortState, LoanSortFn] => {
  const [state, setState] = useState<LoanSortState>(["amount", "asc"]);

  const onSort = useCallback((col) => setState(sortReducer(col)), []);

  return [state, onSort];
};

function sortReducer(col: LoanSortCols) {
  return (state: LoanSortState): LoanSortState => {
    if (state[0] === col) {
      return [state[0], state[1] === "asc" ? "desc" : "asc"];
    }
    return [col, "asc"];
  };
}

interface LoanRowProps {
  item: LoanJson | LoanOfferJson | GroupedLoanOfferJson;
  subtitle?: React.ReactNode;
  onClick: () => void;
}

export const LoanRow = ({ item, subtitle, onClick }: LoanRowProps) => {
  const floorPrice = item.Collection.floorPrice;
  const creatorBasisPoints =
    "creatorBasisPoints" in item
      ? item.creatorBasisPoints
      : item.Collection.loanBasisPoints;
  const mint = "mint" in item ? item.mint : item.Collection.mint;

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCellNew subtitle={subtitle} mint={mint} />
      <Td isNumeric>{utils.formatHexDuration(item.duration)}</Td>
      <Td isNumeric>
        <Text mb="1">
          {utils.basisPointsToPercent(item.basisPoints + creatorBasisPoints)}
        </Text>
        <Tooltip label="Lender and creator interest rates.">
          <Text fontSize="xs" color="gray.500">
            ({utils.basisPointsToPercent(item.basisPoints)},{" "}
            {utils.basisPointsToPercent(creatorBasisPoints)})
          </Text>
        </Tooltip>
      </Td>
      <Td isNumeric>{getLTV(floorPrice, item.amount)}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">
            {item.amount ? utils.formatHexAmount(item.amount) : null}
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
