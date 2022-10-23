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

import { LoanOffer } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { ColumnHeader, NFTCell } from "../../table";
import { OfferLoanModal, TakeLoanModal } from "../../form";
import { EmptyMessage } from "../../table";
import { SortFn, LoanSortCols } from "./common";

interface LoanOffersProps {
  heading: string;
  offers: LoanOffer[];
  direction: number;
  sortCol: LoanSortCols;
  onSort: SortFn;
}

export const LoanOffers = ({
  heading,
  offers,
  sortCol,
  direction,
  onSort,
}: LoanOffersProps) => {
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<LoanOffer | null>(null);

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
          onClick={() => setOfferModal(true)}
        >
          Create Offer
        </Button>
      </Box>
      {offers.length ? (
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
              {offers.map((offer) => (
                <LoanOfferRow
                  key={offer.publicKey.toBase58()}
                  offer={offer}
                  onSelect={() => setOffer(offer)}
                />
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyMessage>No offers currently</EmptyMessage>
      )}
      <OfferLoanModal
        open={offerModal}
        onRequestClose={() => setOfferModal(false)}
      />
      <TakeLoanModal
        offer={offer}
        open={Boolean(offer)}
        onRequestClose={() => setOffer(null)}
      />
    </>
  );
};

interface LoanOfferRowProps {
  offer: LoanOffer;
  onSelect: () => void;
}

const LoanOfferRow = ({ offer, onSelect }: LoanOfferRowProps) => {
  const floorPriceQuery = useFloorPriceQuery(offer?.metadata.data.symbol);

  const floorPrice = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPriceQuery.data]);

  const ltv = useLTV(offer?.data.amount, floorPriceQuery.data?.floorPrice);

  return (
    <>
      <Tr
        key={offer.publicKey.toBase58()}
        cursor="pointer"
        _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
        onClick={() => onSelect()}
      >
        <NFTCell metadata={offer?.metadata} />
        <Td>{offer.duration}</Td>
        <Td isNumeric>{offer.apy}</Td>
        <Td isNumeric>{ltv}</Td>
        <Td isNumeric>
          <Box>
            <Text mb="1">{offer.amount}</Text>
            <Text fontSize="xs" color="gray.500">
              Floor {floorPrice ?? "..."}
            </Text>
          </Box>
        </Td>
      </Tr>
    </>
  );
};
