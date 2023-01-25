import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

import * as utils from "../../common/utils";
import {
  NftResult,
  GroupedCallOptionBidJson,
  CallOptionBidJson,
} from "../../common/types";
import {
  useCloseCallOptionBidMutation,
  useSellCallOptionMutation,
} from "../../hooks/mutation";
import { useCallOptionBidsQuery } from "../../hooks/query";
import { MutationDialog } from "../dialog";
import {
  ModalProps,
  SelectNftForm,
  CollectionDetails,
  CallOptionDetails,
} from "./common";

interface SellCallOptionModalProps extends ModalProps {
  groupedBid: GroupedCallOptionBidJson | null;
}

export const SellCallOptionModal = ({
  groupedBid,
  open,
  onRequestClose,
}: SellCallOptionModalProps) => {
  const [selected, setSelected] = useState<CallOptionBidJson | null>(null);

  function renderBody() {
    if (selected) {
      return <SellCallOption bid={selected} onRequestClose={onRequestClose} />;
    }

    if (groupedBid) {
      return (
        <BidsList
          groupedBid={groupedBid}
          onSelect={(bid) => setSelected(bid)}
        />
      );
    }

    return null;
  }

  return (
    <Modal
      isCentered
      size={selected ? "2xl" : "4xl"}
      isOpen={open}
      onClose={onRequestClose}
      onCloseComplete={() => setSelected(null)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl" fontWeight="black">
          Loan Offers
        </ModalHeader>
        {renderBody()}
      </ModalContent>
    </Modal>
  );
};

interface BidsListProps {
  groupedBid: GroupedCallOptionBidJson;
  onSelect: (offer: CallOptionBidJson) => void;
}

const BidsList = ({ groupedBid, onSelect }: BidsListProps) => {
  const wallet = useWallet();
  const walletAddress = wallet?.publicKey?.toBase58() ?? "";
  const offersQuery = useCallOptionBidsQuery({
    collections: [groupedBid.Collection.address],
    amount: groupedBid.amount ?? undefined,
    strikePrice: groupedBid.strikePrice,
    expiry: groupedBid.expiry,
  });

  const renderedRows = offersQuery.data?.map((item) => (
    <Tr key={item.address}>
      <Td>{item.buyer}</Td>
      <Td isNumeric>
        <Button
          disabled={walletAddress === item.buyer}
          onClick={() => onSelect(item)}
        >
          Take
        </Button>
      </Td>
    </Tr>
  ));

  return (
    <>
      <ModalBody>
        <CollectionDetails
          collection={groupedBid.Collection}
          forecast={
            <CallOptionDetails
              amount={BigInt(groupedBid.amount)}
              strikePrice={BigInt(groupedBid.strikePrice)}
              expiry={utils.hexToNumber(groupedBid.expiry)}
              creatorBasisPoints={groupedBid.Collection.optionBasisPoints}
            />
          }
        />
        <Box p="6">
          <TableContainer
            maxW="100%"
            borderTop="1px"
            borderColor="gray.800"
            width="100%"
          >
            <Table size="sm" sx={{ tableLayout: "fixed" }}>
              <Thead>
                <Tr>
                  <Th>Lender</Th>
                </Tr>
              </Thead>
              <Tbody>{renderedRows}</Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ModalBody>
    </>
  );
};

const SellCallOption = ({}) => {};

const CloseBid = ({ open, bid, onRequestClose }: SellCallOptionModalProps) => {
  const mutation = useCloseCallOptionBidMutation(onRequestClose);

  return (
    <MutationDialog
      header="Close Bid"
      content="Do you wish to cancel this bid?"
      open={open}
      loading={mutation.isLoading}
      onConfirm={() => {
        if (bid) {
          mutation.mutate(bid);
        }
      }}
      onRequestClose={onRequestClose}
    />
  );
};
