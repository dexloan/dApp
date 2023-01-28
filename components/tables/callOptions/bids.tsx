import { Button, Icon, Text, Th, Tr, Td, Tooltip } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";

import { ColumnHeader, Col } from "../../table";
import { BidCallOptionModal, SellCallOptionModal } from "../../form";
import { ListingsTable } from "../../table";
import {
  OptionRow,
  CallOptionSortCols,
  useCallOptionSortState,
} from "./common";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { GroupedCallOptionBidJson } from "../../../common/types";

const BID_COLS: Readonly<Col<CallOptionSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "expiry", label: "Expiry" },
  { name: "cost", label: "Cost", isNumeric: true },
  { name: "strikePrice", label: "Strike Price", isNumeric: true },
] as const;

interface CallOptionBidsProps {
  heading: string;
  bids?: GroupedCallOptionBidJson[];
  isLoading: boolean;
}

export const CallOptionBids = ({
  heading,
  bids,
  isLoading,
}: CallOptionBidsProps) => {
  const wallet = useWallet();
  const modal = useWalletModal();
  const [bidModal, setBidModal] = useState<boolean>(false);
  const [bid, setBid] = useState<GroupedCallOptionBidJson | null>(null);
  const [sortState, onSort] = useCallOptionSortState();

  return (
    <>
      <ListingsTable<CallOptionSortCols, GroupedCallOptionBidJson>
        heading={heading}
        placeholder="Currently no bids"
        action={
          <Button
            size="sm"
            leftIcon={<Icon as={IoAdd} />}
            isDisabled={!wallet.publicKey}
            onClick={() => setBidModal(true)}
          >
            Create Bid
          </Button>
        }
        cols={BID_COLS}
        items={bids}
        isLoading={isLoading}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th key={col.name}>Collection</Th>;
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
            key={`${item.Collection.address}_${item.amount}_${item.strikePrice}_${item.expiry}`}
            subtitle={`${item._count} Bid${item._count > 1 ? "s" : ""}`}
            option={item}
            onClick={() => {
              if (!wallet.publicKey) {
                modal.setVisible(true);
              }
              setBid(item);
            }}
          />
        )}
      />
      <BidCallOptionModal
        open={bidModal}
        onRequestClose={() => setBidModal(false)}
      />
      <SellCallOptionModal
        groupedBid={bid}
        open={Boolean(bid)}
        onRequestClose={() => setBid(null)}
      />
    </>
  );
};
