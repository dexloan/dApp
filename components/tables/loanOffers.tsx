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

import { LoanOffer } from "../../common/model";
import {
  useFloorPriceQuery,
  useLoanOffersQuery,
  useFloorPricesQuery,
} from "../../hooks/query";
import { useLTV } from "../../hooks/render";
import { ColumnHeader, NFTCell } from "../../components/table";
import { compareBy, sortReducer, LoanSortState, LoanSortCols } from "./common";

export const LoanOffers = () => {
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
    () => (offersQuery.data ?? []).sort(compareBy(sortCol, direction)),
    [offersQuery.data, sortCol, direction]
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
        <Button size="sm" leftIcon={<Icon as={IoAdd} />}>
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
                Borrowing
              </ColumnHeader>
            </Tr>
          </Thead>
          <Tbody>
            {offers.map((offer) => (
              <LoanOfferRow key={offer.publicKey.toBase58()} offer={offer} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
};

interface LoanOfferRowProps {
  offer: LoanOffer;
}

const LoanOfferRow = ({ offer }: LoanOfferRowProps) => {
  const floorPriceQuery = useFloorPriceQuery(offer?.metadata.data.symbol);

  const floorPrice = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPriceQuery.data]);

  const ltv = useLTV(offer?.data.amount, floorPriceQuery.data?.floorPrice);

  return (
    <Tr
      key={offer.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => {
        /* take offer */
      }}
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
  );
};
