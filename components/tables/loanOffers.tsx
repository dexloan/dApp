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
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { IoAdd } from "react-icons/io5";
import { useMemo, useState } from "react";

import { LoanOffer } from "../../common/model";
import {
  useFloorPriceQuery,
  useLoanOffersQuery,
  useFloorPricesQuery,
} from "../../hooks/query";
import { useLTV } from "../../hooks/render";
import { ColumnHeader, NFTCell } from "../table";
import { OfferLoanModal, TakeLoanModal } from "../form";
import { compareBy, sortReducer, LoanSortState, LoanSortCols } from "./common";

export const LoanOffers = () => {
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [[sortCol, direction], setSortBy] = useState<LoanSortState>([
    "amount",
    1,
  ]);

  function sort(col: LoanSortCols) {
    setSortBy(sortReducer(col));
  }

  const offersQuery = useLoanOffersQuery();
  const floorPriceQueries = useFloorPricesQuery();

  const offers = useMemo(
    () =>
      (offersQuery.data ?? [])
        .map(LoanOffer.fromJSON)
        .sort(compareBy(sortCol, direction, floorPriceQueries.data)),
    [offersQuery.data, floorPriceQueries.data, sortCol, direction]
  );

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="2"
      >
        <Heading as="h3" color="gray.200" size="sm">
          Offers
        </Heading>
        <Button
          size="sm"
          leftIcon={<Icon as={IoAdd} />}
          onClick={() => setOfferModal(true)}
        >
          Create Offer
        </Button>
      </Box>
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
                onClick={() => sort("duration")}
              >
                Duration
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "apy" ? direction : 0}
                onClick={() => sort("apy")}
              >
                APY
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "ltv" ? direction : 0}
                onClick={() => sort("ltv")}
              >
                LTV
              </ColumnHeader>
              <ColumnHeader
                isNumeric
                direction={sortCol === "amount" ? direction : 0}
                onClick={() => sort("amount")}
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
