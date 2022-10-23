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
import { NFTResult } from "../../common/types";
import { Collection, LoanOffer } from "../../common/model";
import {
  useCloseLoanOfferMutation,
  useTakeLoanMutation,
} from "../../hooks/mutation/loan";
import { ModalProps, SelectNFTForm, LoanDetails, LoanForecast } from "./common";
import { MutationDialog } from "../dialog";

interface TakeLoanModalProps extends ModalProps {
  offer: LoanOffer | null;
}

export const TakeLoanModal = ({
  offer,
  open,
  onRequestClose,
}: TakeLoanModalProps) => {
  const anchorWallet = useAnchorWallet();

  if (anchorWallet) {
    const isLender = anchorWallet && offer?.isLender(anchorWallet);

    if (isLender) {
      return (
        <CloseOffer open={open} offer={offer} onRequestClose={onRequestClose} />
      );
    }

    return (
      <TakeLoan open={open} offer={offer} onRequestClose={onRequestClose} />
    );
  }

  return null; // TODO connect wallet
};

const TakeLoan = ({ open, offer, onRequestClose }: TakeLoanModalProps) => {
  const [selected, setSelected] = useState<NFTResult | null>(null);
  const mutation = useTakeLoanMutation(onRequestClose);

  function onSubmit() {
    if (offer && selected) {
      mutation.mutate({
        offer,
        mint: selected.metadata.mint,
      });
    }
  }

  const body = selected ? (
    <>
      <ModalBody>
        <LoanDetails
          nft={selected}
          forecast={
            <LoanForecast
              amountLabel="Borrowing"
              amount={offer?.data.amount}
              duration={offer?.data.duration}
              basisPoints={offer?.data.basisPoints}
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
    <SelectNFTForm
      collectionMint={offer?.metadata.mint}
      onSelect={setSelected}
    />
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
          Take Loan
        </ModalHeader>
        {body}
      </ModalContent>
    </Modal>
  );
};

const CloseOffer = ({ open, offer, onRequestClose }: TakeLoanModalProps) => {
  const mutation = useCloseLoanOfferMutation(onRequestClose);

  return (
    <MutationDialog
      header="Close Offer"
      content="Do you wish to cancel this offer?"
      open={open}
      loading={mutation.isLoading}
      onConfirm={() => {
        if (offer) {
          mutation.mutate(offer);
        }
      }}
      onRequestClose={onRequestClose}
    />
  );
};
