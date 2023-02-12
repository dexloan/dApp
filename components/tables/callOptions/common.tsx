import { useCallback, useMemo, useState } from "react";
import { Text, Tr, Td } from "@chakra-ui/react";

import type {
  CallOptionBidJson,
  CallOptionJson,
  GroupedCallOptionBidJson,
} from "../../../common/types";
import * as utils from "../../../common/utils";
import { NFTCellNew } from "../../table";
import { FloorPrice } from "../../floorPrice";
import {
  useAmount,
  useExpiry,
  useStrikePrice,
  useFloorPrice,
} from "../../../hooks/render";

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
  const amount = useAmount(option);
  const strikePrice = useStrikePrice(option);
  const expiry = useExpiry(option);
  const floorPrice = useFloorPrice(option);
  const duration = useMemo(() => {
    const timeUntilExpiry =
      BigInt(option.expiry) - BigInt(Math.round(Date.now() / 1000));
    return utils.formatHexDuration("0x" + timeUntilExpiry.toString(16));
  }, [option]);

  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCellNew
        subtitle={subtitle}
        mint={"mint" in option ? option.mint : option.Collection.mint}
        collection={option.Collection}
      />
      <Td>
        <Text mb="1">{expiry}</Text>
        <Text fontSize="xs" color="gray.500">
          {duration}
        </Text>
      </Td>
      <Td isNumeric>{amount}</Td>
      <Td isNumeric>
        <Text mb="1">{strikePrice}</Text>
        <FloorPrice>{floorPrice}</FloorPrice>
      </Td>
    </Tr>
  );
};
