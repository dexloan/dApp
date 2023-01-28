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
  ModalFooter,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
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
  MintDetails,
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
  const [selected, setSelected] = useState<NftResult | null>(null);
  const [selectedBid, setSelectedBid] = useState<CallOptionBidJson | null>(
    null
  );

  function renderBody() {
    if (selectedBid) {
      return (
        <SellCallOption
          bid={selectedBid}
          selected={selected}
          onSelect={setSelected}
          onRequestClose={onRequestClose}
        />
      );
    }

    if (groupedBid) {
      return (
        <BidsList
          groupedBid={groupedBid}
          onSelect={(bid) => setSelectedBid(bid)}
        />
      );
    }

    return null;
  }

  function getModalSize() {
    if (selected) {
      return "2xl";
    }

    return "4xl";
  }

  function renderHeader() {
    if (selected) {
      return "Confirm sell call option";
    }

    if (selectedBid) {
      return "Select an NFT to sell";
    }

    return "Select a buyer";
  }

  return (
    <Modal
      isCentered
      size={getModalSize()}
      isOpen={open}
      onClose={onRequestClose}
      onCloseComplete={() => setSelected(null)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl" fontWeight="black">
          {renderHeader()}
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
          Sell
        </Button>
      </Td>
    </Tr>
  ));

  return (
    <>
      <ModalBody>
        <MintDetails
          name={groupedBid.Collection.name ?? undefined}
          uri={groupedBid.Collection.uri ?? undefined}
          info={
            <CallOptionDetails
              amount={BigInt(groupedBid.amount)}
              strikePrice={BigInt(groupedBid.strikePrice)}
              expiry={utils.hexToNumber(groupedBid.expiry)}
              creatorBasisPoints={groupedBid.Collection.optionBasisPoints}
            />
          }
        />
        <Box p="6">
          {offersQuery.isLoading ? (
            <Box display="flex" w="100%" p="6" justifyContent="center">
              <Spinner size="sm" />
            </Box>
          ) : (
            <TableContainer
              maxW="100%"
              borderTop="1px"
              borderColor="gray.800"
              width="100%"
            >
              <Table size="sm" sx={{ tableLayout: "fixed" }}>
                <Thead>
                  <Tr>
                    <Th>Buyer</Th>
                  </Tr>
                </Thead>
                <Tbody>{renderedRows}</Tbody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </ModalBody>
    </>
  );
};

interface SellCallOptionProps {
  bid: CallOptionBidJson;
  selected: NftResult | null;
  onSelect: (nft: NftResult | null) => void;
  onRequestClose: () => void;
}

const SellCallOption = ({
  bid,
  selected,
  onSelect,
  onRequestClose,
}: SellCallOptionProps) => {
  const mutation = useSellCallOptionMutation(onRequestClose);

  function onSubmit() {
    if (bid && selected) {
      mutation.mutate({
        bid,
        mint: selected.metadata.mint,
      });
    }
  }

  return selected ? (
    <>
      <ModalBody>
        <MintDetails
          name={selected?.metadata.data.name}
          uri={selected.metadata.data.uri}
          info={
            <CallOptionDetails
              amount={BigInt(bid.amount)}
              strikePrice={BigInt(bid.strikePrice)}
              expiry={utils.hexToNumber(bid.expiry)}
              creatorBasisPoints={bid.Collection.optionBasisPoints}
            />
          }
        />
      </ModalBody>
      <ModalFooter>
        <SimpleGrid columns={2} spacing={2} width="100%">
          <Box>
            <Button
              isFullWidth
              disabled={mutation.isLoading}
              onClick={() => onSelect(null)}
            >
              Cancel
            </Button>
          </Box>
          <Box>
            <Button
              isFullWidth
              variant="primary"
              isLoading={mutation.isLoading}
              onClick={onSubmit}
            >
              Confirm
            </Button>
          </Box>
        </SimpleGrid>
      </ModalFooter>
    </>
  ) : (
    <ModalBody>
      <SelectNftForm
        listingType="callOption"
        collection={bid.Collection}
        onSelect={onSelect}
      />
    </ModalBody>
  );
};

interface CloseBidProps extends ModalProps {
  bid: CallOptionBidJson;
}

const CloseBid = ({ open, bid, onRequestClose }: CloseBidProps) => {
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
