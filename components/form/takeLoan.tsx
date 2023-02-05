import { useState, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
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
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  CircularProgress,
  Spinner,
} from "@chakra-ui/react";

import {
  GroupedLoanOfferJson,
  LoanOfferJson,
  NftResult,
} from "../../common/types";
import { useLoanOffersQuery } from "../../hooks/query";
import { useTakeLoanMutation } from "../../hooks/mutation/loan";
import { ModalProps, SelectNftForm, MintDetails, LoanForecast } from "./common";

interface TakeLoanModalProps extends ModalProps {
  groupedOffer: GroupedLoanOfferJson | null;
}

export const TakeLoanModal = ({
  open,
  groupedOffer,
  onRequestClose,
}: TakeLoanModalProps) => {
  const [selected, setSelected] = useState<LoanOfferJson | null>(null);

  function renderBody() {
    if (selected) {
      return <TakeLoanOffer offer={selected} onRequestClose={onRequestClose} />;
    }

    if (groupedOffer) {
      return (
        <OffersList
          groupedOffer={groupedOffer}
          onSelect={(offer) => setSelected(offer)}
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

interface OffersListProps {
  groupedOffer: GroupedLoanOfferJson;
  onSelect: (offer: LoanOfferJson) => void;
}

const OffersList = ({ groupedOffer, onSelect }: OffersListProps) => {
  const wallet = useWallet();
  const walletAddress = wallet?.publicKey?.toBase58() ?? "";
  const offersQuery = useLoanOffersQuery({
    collections: [groupedOffer.Collection.address],
    amount: groupedOffer.amount ?? undefined,
    duration: groupedOffer.duration,
    basisPoints: groupedOffer.basisPoints,
  });

  const renderedRows = useMemo(
    () =>
      offersQuery.data?.map((item) => (
        <Tr key={item.address}>
          <Td>{item.lender}</Td>
          <Td isNumeric>
            <Button
              disabled={walletAddress === item.lender}
              onClick={() => onSelect(item)}
            >
              Take
            </Button>
          </Td>
        </Tr>
      )),
    [offersQuery.data, walletAddress, onSelect]
  );

  return (
    <>
      <ModalBody>
        <MintDetails
          name={groupedOffer.Collection.name ?? undefined}
          uri={groupedOffer.Collection.uri ?? undefined}
          info={
            <LoanForecast
              amountLabel="Borrowing"
              amount={groupedOffer.amount}
              duration={groupedOffer.duration}
              basisPoints={groupedOffer.basisPoints}
              creatorBasisPoints={groupedOffer.Collection.loanBasisPoints}
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
              <Tbody>
                {offersQuery.isLoading ? (
                  <Box
                    display="flex"
                    width="100%"
                    justifyContent="center"
                    pb="6"
                  >
                    <Spinner size="sm" />
                  </Box>
                ) : (
                  renderedRows
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </ModalBody>
    </>
  );
};

interface TakeLoanOfferProps {
  offer: LoanOfferJson;
  onRequestClose: () => void;
}

const TakeLoanOffer = ({ offer, onRequestClose }: TakeLoanOfferProps) => {
  const [selected, setSelected] = useState<NftResult | null>(null);
  const mutation = useTakeLoanMutation(onRequestClose);

  function onSubmit() {
    if (offer && selected) {
      mutation.mutate({
        offer,
        mint: selected.metadata.mint,
      });
    }
  }

  return selected ? (
    <>
      <ModalBody>
        <MintDetails
          name={selected.metadata.data.name}
          uri={selected.metadata.data.uri}
          info={
            <LoanForecast
              amountLabel="Borrowing"
              amount={offer.amount}
              duration={offer.duration}
              basisPoints={offer.basisPoints}
              creatorBasisPoints={offer.Collection.loanBasisPoints}
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
    <ModalBody>
      <SelectNftForm
        listingType="loan"
        collection={offer.Collection}
        onSelect={setSelected}
      />
    </ModalBody>
  );
};
