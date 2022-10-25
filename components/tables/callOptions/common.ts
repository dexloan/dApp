import { useCallback, useMemo, useState } from "react";
import {
  CallOption,
  CallOptionPretty,
  CallOptionBid,
  CallOptionBidPretty,
} from "../../../common/model";

export type CallOptionSortCols = "expiry" | "strikePrice" | "cost";
export type CallOptionSortState = [CallOptionSortCols, number];
export type CallOptionSortFn = (col: CallOptionSortCols) => void;

export const useLoanSortState = (): [CallOptionSortState, CallOptionSortFn] => {
  const [state, setState] = useState<CallOptionSortState>(["strikePrice", 1]);

  const onSort = useCallback((col) => setState(sortReducer(col)), []);

  return [state, onSort];
};

export function sortReducer(col: CallOptionSortCols) {
  return (state: CallOptionSortState): CallOptionSortState => {
    if (state[0] === col) {
      return [state[0], state[1] * -1];
    }
    return [col, 1];
  };
}

export const useSortedCallOptionBids = (
  offers: CallOptionBidPretty[] = [],
  state: CallOptionSortState
) => {
  return useMemo(() => {
    const [sortCol, direction] = state;

    return offers
      .map(CallOptionBid.fromJSON)
      .sort(compareBy(sortCol, direction));
  }, [offers, state]);
};

export const useSortedCallOptions = (
  offers: CallOptionPretty[] = [],
  state: CallOptionSortState
) => {
  return useMemo(() => {
    const [sortCol, direction] = state;

    return offers.map(CallOption.fromJSON).sort(compareBy(sortCol, direction));
  }, [offers, state]);
};

function compareBy(sortCol: CallOptionSortCols, direction: number) {
  switch (sortCol) {
    case "expiry":
      return sortByExpiry(direction);

    case "strikePrice":
      return sortByStrikePrice(direction);

    case "cost":
      return sortByCost(direction);

    default:
      return (a: CallOption | CallOptionBid) => {
        return 1;
      };
  }
}

function sortByExpiry(direction: number) {
  return (...args: CallOption[] | CallOptionBid[]) => {
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

function sortByStrikePrice(direction: number) {
  return (...args: CallOption[] | CallOptionBid[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.strikePrice.sub(args[1].data.strikePrice).toNumber();
  };
}

function sortByCost(direction: number) {
  return (...args: CallOption[] | CallOptionBid[]) => {
    if (direction === -1) {
      args.reverse();
    }

    return args[0].data.amount.sub(args[1].data.amount).toNumber();
  };
}
