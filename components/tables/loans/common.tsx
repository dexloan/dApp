import { Box, Tr, Td, Text, Tooltip } from "@chakra-ui/react";
import { useState, useCallback } from "react";

import * as utils from "../../../common/utils";
import { SortDirection } from "../../../common/types";
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
      <Td isNumeric>{utils.formatHexDuration(loan.duration)}</Td>
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
