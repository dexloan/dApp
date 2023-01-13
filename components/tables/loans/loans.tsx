import { Th } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { LoanJson } from "../../../common/types";

import { Col, ColumnHeader, ListingsTable } from "../../table";
import { LoanRow, LoanSortCols, useLoanSortState } from "./common";

const LOAN_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "asset", label: "Asset" },
  { name: "duration", label: "Duration" },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanListingsProps {
  heading: string;
  placeholderMessage: string;
  isLoading?: boolean;
  action?: React.ReactNode;
  loans?: LoanJson[];
}

export const LoanListings = ({
  isLoading,
  heading,
  placeholderMessage,
  action = null,
  loans,
}: LoanListingsProps) => {
  const router = useRouter();
  const [sortState, onSort] = useLoanSortState();

  return (
    <ListingsTable<LoanSortCols, LoanJson>
      isLoading={isLoading}
      heading={heading}
      placeholder={placeholderMessage}
      action={action}
      cols={LOAN_COLS}
      items={loans}
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
        <LoanRow
          key={item.address}
          loan={item}
          onClick={() => router.push(`/loans/item/${item.address}`)}
        />
      )}
    />
  );
};
