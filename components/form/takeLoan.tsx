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
} from "@chakra-ui/react";
import { NFTResult } from "../../common/types";
import { Collection, LoanOffer } from "../../common/model";
import { useTakeLoanMutation } from "../../hooks/mutation/loan";
import { ModalProps, SelectNFTForm, LoanDetails, LoanForecast } from "./common";

interface TakeLoanModalProps extends ModalProps {
  offer: LoanOffer | null;
}

export const TakeLoanModal = ({
  offer,
  open,
  onRequestClose,
}: TakeLoanModalProps) => {
  const [selected, setSelected] = useState<NFTResult | null>(null);
  const mutation = useTakeLoanMutation(onRequestClose);

  function onSubmit() {
    if (offer) {
      mutation.mutate(offer.data);
    }
  }

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
        {selected ? (
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
              <Button
                isFullWidth
                variant="primary"
                isLoading={mutation.isLoading}
                onClick={onSubmit}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        ) : (
          <SelectNFTForm
            collectionMint={offer?.metadata.collection?.key}
            onSelect={setSelected}
          />
        )}
      </ModalContent>
    </Modal>
  );
};
