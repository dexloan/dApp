import { Button, Icon, Th } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";

import { CallOptionBid, CallOptionBidPretty } from "../../../common/model";
import { ColumnHeader, Col } from "../../table";
import { BidCallOptionModal, SellCallOptionModal } from "../../form";
import { ListingsTable } from "../../table";
import {
  CallOptionSortCols,
  useCallOptionSortState,
  useSortedCallOptionBids,
} from "./common";
import { OptionRow } from "./callOptions";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const BID_COLS: Readonly<Col<CallOptionSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "expiry", label: "Expiry" },
  { name: "cost", label: "Cost", isNumeric: true },
  { name: "strikePrice", label: "Strike Price", isNumeric: true },
] as const;

interface CallOptionBidsProps {
  heading: string;
  bids?: CallOptionBidPretty[];
}

export const CallOptionBids = ({ heading, bids }: CallOptionBidsProps) => {
  const wallet = useWallet();
  const modal = useWalletModal();
  const [bidModal, setBidModal] = useState<boolean>(false);
  const [bid, setBid] = useState<CallOptionBid | null>(null);

  const [sortState, onSort] = useCallOptionSortState();
  const sortedOptions = useSortedCallOptionBids(bids, sortState);

  return (
    <>
      <ListingsTable<CallOptionSortCols, CallOptionBid>
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
        items={sortedOptions}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th>Collection</Th>;
          }

          return (
            <ColumnHeader
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
        bid={bid}
        open={Boolean(bid)}
        onRequestClose={() => setBid(null)}
      />
    </>
  );
};
