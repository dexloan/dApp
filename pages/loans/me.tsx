import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Th } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import { LoanJson, LoanOfferJson } from "../../common/types";
import {
  LoanFilters,
  useLoansQuery,
  useLoanOffersQuery,
} from "../../hooks/query";
import { useCloseLoanOfferMutation } from "../../hooks/mutation";
import { ListingsTable, ColumnHeader, LTVHeader } from "../../components/table";
import {
  useLoanSortState,
  LoanRow,
  LoanSortCols,
  OFFER_COLS,
  LOAN_COLS,
} from "../../components/tables/loans";
import { MutationDialog } from "../../components/dialog";
import { LoanLayout } from "../../components/layout/loan";

const MyItems: NextPage = () => {
  const { publicKey } = useWallet();
  const [collections, setCollections] = useState<string[]>([]);

  if (!publicKey) {
    return null;
  }

  return (
    <LoanLayout setCollections={setCollections}>
      <MyLoans
        heading="Borrowing"
        placeholder="No borrowings currently"
        filters={{ collections, borrower: publicKey.toBase58() }}
      />
      <MyLoans
        heading="Lending"
        placeholder="No lendings currently"
        filters={{ collections, lender: publicKey.toBase58() }}
      />
      <MyOffers collections={collections} />
    </LoanLayout>
  );
};

interface MyLoansProps {
  heading: string;
  placeholder: string;
  filters: LoanFilters;
}

const MyLoans = ({ heading, placeholder, filters }: MyLoansProps) => {
  const router = useRouter();
  const [sortState, sortBy] = useLoanSortState();
  const myLoansQuery = useLoansQuery(filters);
  console.log("myLoansQuery: ", myLoansQuery);

  return (
    <ListingsTable<LoanSortCols, LoanJson>
      isLoading={myLoansQuery.isLoading}
      heading={heading}
      placeholder={placeholder}
      cols={LOAN_COLS}
      items={myLoansQuery.data}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
        }

        if (col.name === "ltv") {
          return <LTVHeader key={col.name} />;
        }

        return (
          <ColumnHeader
            key={col.name}
            isNumeric={col.isNumeric}
            direction={sortState[0] === col.name ? sortState[1] : undefined}
            onClick={() => sortBy(col.name)}
          >
            {col.label}
          </ColumnHeader>
        );
      }}
      renderRow={(item) => (
        <LoanRow
          key={item.address}
          item={item}
          subtitle={item.state}
          onClick={() => router.push(`/loans/item/${item.address}`)}
        />
      )}
    />
  );
};

interface MyOffersProps {
  collections: string[];
}

const MyOffers = ({ collections }: MyOffersProps) => {
  const { publicKey } = useWallet();
  const [sortState, sortBy] = useLoanSortState();
  const offersQuery = useLoanOffersQuery({
    lender: publicKey?.toBase58(),
    collections,
  });

  const [closeDialog, setCloseDialog] = useState<LoanOfferJson | null>(null);
  const mutation = useCloseLoanOfferMutation(() => setCloseDialog(null));

  return (
    <>
      <ListingsTable<LoanSortCols, LoanOfferJson>
        heading="Your Offers"
        placeholder="No offers currently"
        // action={
        //   <Button
        //     size="sm"
        //     leftIcon={<Icon as={IoAdd} />}
        //     isDisabled={!wallet.publicKey}
        //     onClick={() => setOfferModal(true)}
        //   >
        //     Offer Loan
        //   </Button>
        // }
        cols={OFFER_COLS}
        items={offersQuery.data}
        isLoading={offersQuery.isLoading}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th key={col.name}>{col.label}</Th>;
          }

          if (col.name === "ltv") {
            return <LTVHeader />;
          }

          return (
            <ColumnHeader
              key={col.name}
              isNumeric={col.isNumeric}
              direction={sortState[0] === col.name ? sortState[1] : undefined}
              onClick={() => sortBy(col.name)}
            >
              {col.label}
            </ColumnHeader>
          );
        }}
        renderRow={(item) => {
          return (
            <LoanRow
              key={item.address}
              item={item}
              subtitle="1 Offer"
              onClick={() => {
                setCloseDialog(item);
              }}
            />
          );
        }}
      />
      <MutationDialog
        header="Close Offer"
        content="Do you wish to cancel this offer?"
        open={Boolean(closeDialog)}
        loading={mutation.isLoading}
        onConfirm={() => {
          if (closeDialog) {
            mutation.mutate(closeDialog);
          }
        }}
        onRequestClose={() => setCloseDialog(null)}
      />
    </>
  );
};

export default MyItems;
