import { useCallback, useState } from "react";
import { Text, Tr, Td } from "@chakra-ui/react";

import * as utils from "../../../common/utils";
import dayjs from "../../../common/lib/dayjs";
import { NFTCellNew } from "../../table";
import { FloorPrice } from "../../floorPrice";
import {
  CallOptionBidJson,
  CallOptionJson,
  GroupedCallOptionBidJson,
} from "../../../common/types";

export type CallOptionSortCols =
  | "collection"
  | "asset"
  | "expiry"
  | "strikePrice"
  | "cost";
export type CallOptionSortState = [CallOptionSortCols, "asc" | "desc"];
export type CallOptionSortFn = (col: CallOptionSortCols) => void;

export const useCallOptionSortState = (): [
  CallOptionSortState,
  CallOptionSortFn
] => {
  const [state, setState] = useState<CallOptionSortState>([
    "strikePrice",
    "asc",
  ]);

  const onSort = useCallback((col) => setState(sortReducer(col)), []);

  return [state, onSort];
};

function sortReducer(col: CallOptionSortCols) {
  return (state: CallOptionSortState): CallOptionSortState => {
    if (state[0] === col) {
      return [state[0], state[1] === "asc" ? "desc" : "asc"];
    }
    return [col, "asc"];
  };
}

interface OptionRowProps {
  subtitle?: React.ReactNode;
  option: CallOptionJson | CallOptionBidJson | GroupedCallOptionBidJson;
  onClick: () => void;
}

export const OptionRow = ({ subtitle, option, onClick }: OptionRowProps) => {
  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCellNew
        subtitle={subtitle}
        mint={"mint" in option ? option.mint : option.Collection.mint}
      />
      <Td>
        <Text mb="1">
          {dayjs.unix(utils.hexToNumber(option.expiry)).format("DD/MM/YYYY")}
        </Text>
        <Text fontSize="xs" color="gray.500">
          {utils.formatHexDuration(option.expiry)}
        </Text>
      </Td>
      <Td isNumeric>{utils.formatHexAmount(option.amount)}</Td>
      <Td isNumeric>
        <Text mb="1">{utils.formatHexAmount(option.strikePrice)}</Text>
        <FloorPrice>
          {utils.formatHexAmount(option.Collection.floorPrice)}
        </FloorPrice>
      </Td>
    </Tr>
  );
};
