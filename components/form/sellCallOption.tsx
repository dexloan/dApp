import * as anchor from "@project-serum/anchor";
import { useState } from "react";
import { Control, Controller, useForm, useWatch } from "react-hook-form";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  SimpleGrid,
} from "@chakra-ui/react";
import { NftResult } from "../../common/types";
import { CallOptionBid } from "../../common/model";
import {
  useCloseCallOptionBidMutation,
  useSellCallOptionMutation,
} from "../../hooks/mutation";
import {
  ModalProps,
  SelectNFTForm,
  CollectionDetails,
  CallOptionDetails,
} from "./common";
import { MutationDialog } from "../dialog";

interface SellCallOptionModalProps extends ModalProps {
  bid: CallOptionBid | null;
}

export const SellCallOptionModal = ({
  bid,
  open,
  onRequestClose,
}: SellCallOptionModalProps) => {
  const anchorWallet = useAnchorWallet();

  if (anchorWallet) {
    const isBuyer = bid?.isBuyer(anchorWallet);

    if (isBuyer) {
      return <CloseBid open={open} bid={bid} onRequestClose={onRequestClose} />;
    }

    return (
      <SellCallOption open={open} bid={bid} onRequestClose={onRequestClose} />
    );
  }

  return null; // TODO connect wallet
};

const SellCallOption = ({
  open,
  bid,
  onRequestClose,
}: SellCallOptionModalProps) => {
  const [selected, setSelected] = useState<NftResult | null>(null);
  const mutation = useSellCallOptionMutation(onRequestClose);

  function onSubmit() {
    if (bid && selected) {
      mutation.mutate({
        bid,
        mint: selected.metadata.mint,
      });
    }
  }

  const body = selected ? (
    <>
      <ModalBody>
        <CollectionDetails
          nft={selected}
          forecast={
            <CallOptionDetails
              amount={bid?.data.amount}
              strikePrice={bid?.data.strikePrice}
              expiry={bid?.data.expiry}
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
              onClick={() => setSelected(null)}
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
    <SelectNFTForm collectionMint={bid?.metadata.mint} onSelect={setSelected} />
  );

  return (
    <Modal
      isCentered
      size={selected ? "2xl" : "4xl"}
      isOpen={open}
      onClose={() => {
        if (!mutation.isLoading) {
          onRequestClose();
        }
      }}
      onCloseComplete={() => setSelected(null)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="xl" fontWeight="black">
          Sell Call Option
        </ModalHeader>
        {body}
      </ModalContent>
    </Modal>
  );
};

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
