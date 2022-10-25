import * as anchor from "@project-serum/anchor";
import {
  Box,
  Button,
  Heading,
  Icon,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useMemo, useState } from "react";

import { CallOptionBid } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { ColumnHeader, NFTCell } from "../../table";
import { CallOptionBidModal, TakeCallOptionModal } from "../../form";
import { EmptyMessage } from "../../table";
import { SortFn, CallOptionSortCols } from "./common";

interface CallOptionBidsProps {
  heading: string;
  bids: CallOptionBid[];
  direction: number;
  sortCol: CallOptionSortCols;
  onSort: SortFn;
}

export const LoanOffers = ({
  heading,
  bids,
  sortCol,
  direction,
  onSort,
}: CallOptionBidsProps) => {
  const [bidModal, setBidModal] = useState<boolean>(false);
  const [bid, setBid] = useState<CallOptionBid | null>(null);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="2"
      >
        <Heading as="h3" color="gray.200" size="sm">
          {heading}
        </Heading>
        <Button
          size="sm"
          leftIcon={<Icon as={IoAdd} />}
          onClick={() => setBidModal(true)}
        >
          Create Bid
        </Button>
      </Box>
      {bids.length ? (
        <TableContainer
          maxW="100%"
          mt="2"
          mb="6"
          borderTop="1px"
          borderColor="gray.800"
          width="100%"
        >
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Collection</Th>
                <ColumnHeader
                  direction={sortCol === "duration" ? direction : 0}
                  onClick={() => onSort("duration")}
                >
                  Duration
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "apy" ? direction : 0}
                  onClick={() => onSort("apy")}
                >
                  APY
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "ltv" ? direction : 0}
                  onClick={() => onSort("ltv")}
                >
                  LTV
                </ColumnHeader>
                <ColumnHeader
                  isNumeric
                  direction={sortCol === "amount" ? direction : 0}
                  onClick={() => onSort("amount")}
                >
                  Lending
                </ColumnHeader>
              </Tr>
            </Thead>
            <Tbody>
              {bids.map((bid) => (
                <BidRow
                  key={bid.publicKey.toBase58()}
                  bid={bid}
                  onSelect={() => setBid(bid)}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyMessage>No offers currently</EmptyMessage>
      )}
      <CallOptionBidModal
        open={offerModal}
        onRequestClose={() => setOfferModal(false)}
      />
      <TakeCallOptionModal
        offer={offer}
        open={Boolean(offer)}
        onRequestClose={() => setOffer(null)}
      />
    </>
  );
};

interface BidRowProps {
  bid: CallOptionBid;
  onSelect: () => void;
}

const BidRow = ({ bid, onSelect }: BidRowProps) => {
  return (
    <Tr
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => onSelect()}
    >
      <NFTCell metadata={bid?.metadata} />
      <Td>{bid.expiry}</Td>
      <Td isNumeric>{bid.strikePrice}</Td>
      <Td isNumeric>{bid.cost}</Td>
    </Tr>
  );
};
