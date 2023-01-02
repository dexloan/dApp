import { Th } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { CallOption, CallOptionPretty } from "../../../common/model";
import { ColumnHeader, ListingsTable, Col } from "../../table";
import {
  OptionRow,
  CallOptionSortCols,
  useCallOptionSortState,
  useSortedCallOptions,
} from "./common";

export const CALL_OPTION_COLS: Readonly<Col<CallOptionSortCols>[]> = [
  { name: "asset", label: "Asset" },
  { name: "expiry", label: "Expiry" },
  { name: "cost", label: "Cost", isNumeric: true },
  { name: "strikePrice", label: "Strike Price", isNumeric: true },
] as const;

interface CallOptionListingsProps {
  heading: string;
  placeholderMessage: string;
  action?: React.ReactNode;
  callOptions?: CallOptionPretty[];
  isLoading: boolean;
}

export const CallOptionListings = ({
  heading,
  placeholderMessage,
  action = null,
  callOptions,
  isLoading,
}: CallOptionListingsProps) => {
  const router = useRouter();
  const [sortState, onSort] = useCallOptionSortState();
  const sortedOptions = useSortedCallOptions(callOptions, sortState);

  return (
    <ListingsTable<CallOptionSortCols, CallOption>
      heading={heading}
      placeholder={placeholderMessage}
      action={action}
      cols={CALL_OPTION_COLS}
      items={sortedOptions}
      isLoading={isLoading}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
        }

        return (
          <ColumnHeader
            key={col.name}
            isNumeric={col.isNumeric}
            direction={sortState[0] === col.name ? sortState[1] : 0}
            onClick={() => onSort(col.name)}
          >
            {col.label}
          </ColumnHeader>
        );
      }}
      renderRow={(item) => (
        <OptionRow
          key={item.address}
          option={item}
          onClick={() => router.push(`/options/${item.address}`)}
        />
      )}
    />
  );
};
