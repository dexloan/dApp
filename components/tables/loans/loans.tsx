import { Th } from "@chakra-ui/react";
import { Loan } from "@prisma/client";
import { useRouter } from "next/router";
import { Collection } from "../../../common/model";
import { LoanWithCollection } from "../../../common/types";

import { Col, ColumnHeader, ListingsTable } from "../../table";
import {
  LoanRow,
  LoanSortCols,
  useLoanSortState,
  useSortedLoans,
} from "./common";

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
  action?: React.ReactNode;
  loans?: LoanWithCollection[];
}

export const LoanListings = ({
  heading,
  placeholderMessage,
  action = null,
  loans,
}: LoanListingsProps) => {
  const router = useRouter();
  const [sortState, onSort] = useLoanSortState();

  return (
    <ListingsTable<LoanSortCols, LoanWithCollection>
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
          onClick={() => router.push(`/loans/${item.address}`)}
        />
      )}
    />
  );
};
