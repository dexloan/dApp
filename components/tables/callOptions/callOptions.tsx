import { Th } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { CallOptionJson } from "../../../common/types";
import { ColumnHeader, ListingsTable, Col } from "../../table";
import {
  OptionRow,
  CallOptionSortCols,
  useCallOptionSortState,
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
  callOptions?: CallOptionJson[];
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

  return (
    <ListingsTable<CallOptionSortCols, CallOptionJson>
      heading={heading}
      placeholder={placeholderMessage}
      action={action}
      cols={CALL_OPTION_COLS}
      items={callOptions}
      isLoading={isLoading}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
        }

        return (
          <ColumnHeader
            key={col.name}
            isNumeric={col.isNumeric}
            direction={sortState[0] === col.name ? sortState[1] : undefined}
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
          onClick={() => router.push(`/options/item/${item.address}`)}
        />
      )}
    />
  );
};
