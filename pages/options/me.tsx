import type { NextPage } from "next";
import { useRouter } from "next/router";
import { Th } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import {
  CallOptionBidJson,
  CallOptionJson,
  LoanJson,
  LoanOfferJson,
} from "../../common/types";
import {
  LoanFilters,
  useCallOptionsQuery,
  useCallOptionBidsQuery,
  CallOptionFilters,
} from "../../hooks/query";
import { useCloseCallOptionBidMutation } from "../../hooks/mutation";
import { ListingsTable, ColumnHeader, LTVHeader } from "../../components/table";
import {
  CallOptionSortCols,
  OptionRow,
  useCallOptionSortState,
  BID_COLS,
  CALL_OPTION_COLS,
} from "../../components/tables/callOptions";
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
      <MyCallOptions
        heading="Owned"
        placeholder="No options currently"
        filters={{ collections, buyer: publicKey.toBase58() }}
      />
      <MyCallOptions
        heading="Sold"
        placeholder="No options currently"
        filters={{ collections, seller: publicKey.toBase58() }}
      />
      <MyBids collections={collections} />
    </LoanLayout>
  );
};

interface MyLoansProps {
  heading: string;
  placeholder: string;
  filters: CallOptionFilters;
}

const MyCallOptions = ({ heading, placeholder, filters }: MyLoansProps) => {
  const router = useRouter();
  const [sortState, sortBy] = useCallOptionSortState();
  const queryResult = useCallOptionsQuery(filters);

  return (
    <ListingsTable<CallOptionSortCols, CallOptionJson>
      isLoading={queryResult.isLoading}
      heading={heading}
      placeholder={placeholder}
      cols={CALL_OPTION_COLS}
      items={queryResult.data}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
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
        <OptionRow
          key={item.address}
          option={item}
          subtitle={item.state}
          onClick={() => router.push(`/options/item/${item.address}`)}
        />
      )}
    />
  );
};

interface MyOffersProps {
  collections: string[];
}

const MyBids = ({ collections }: MyOffersProps) => {
  const { publicKey } = useWallet();
  const [sortState, sortBy] = useCallOptionSortState();
  const offersQuery = useCallOptionBidsQuery({
    buyer: publicKey?.toBase58(),
    collections,
  });

  const [closeDialog, setCloseDialog] = useState<CallOptionBidJson | null>(
    null
  );
  const mutation = useCloseCallOptionBidMutation(() => setCloseDialog(null));

  return (
    <>
      <ListingsTable<CallOptionSortCols, CallOptionBidJson>
        heading="Your Bids"
        placeholder="No bids currently"
        cols={BID_COLS}
        items={offersQuery.data}
        isLoading={offersQuery.isLoading}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th key={col.name}>{col.label}</Th>;
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
            <OptionRow
              key={item.address}
              option={item}
              subtitle="1 Bid"
              onClick={() => {
                setCloseDialog(item);
              }}
            />
          );
        }}
      />
      <MutationDialog
        header="Close Bid"
        content="Do you wish to cancel this bid?"
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
