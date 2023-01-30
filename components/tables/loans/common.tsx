import { Box, Tr, Td, Text, Tooltip } from "@chakra-ui/react";
import { useState, useCallback } from "react";

import * as utils from "../../../common/utils";
import {
  LoanJson,
  LoanOfferJson,
  GroupedLoanOfferJson,
} from "../../../common/types";
import { SortDirection } from "../../../common/types";
import {
  useAmount,
  useAPY,
  useLTV,
  useDuration,
  useFloorPrice,
} from "../../../hooks/render";
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
  const amount = useAmount(item);
  const floorPrice = useFloorPrice(item);
  const apy = useAPY(item);
  const duration = useDuration(item);
  const ltv = useLTV(item);

  const mint = "mint" in item ? item.mint : item.Collection.mint;

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCellNew subtitle={subtitle} mint={mint} />
      <Td isNumeric>{duration}</Td>
      <Td isNumeric>
        <Text mb="1">{apy.total}</Text>
        <Tooltip label="Lender and creator interest rates.">
          <Text fontSize="xs" color="gray.500">
            ({apy.lender}, {apy.creator})
          </Text>
        </Tooltip>
      </Td>
      <Td isNumeric>{ltv}</Td>
      <Td isNumeric>
        <Box>
          <Text mb="1">{amount}</Text>
          <FloorPrice>{floorPrice}</FloorPrice>
        </Box>
      </Td>
    </Tr>
  );
};
