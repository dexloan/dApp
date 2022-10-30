import * as anchor from "@project-serum/anchor";
import { Box, Button, Icon, Tr, Th, Td, Text } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useMemo, useState } from "react";

import { LoanOffer, LoanOfferPretty } from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import { useLTV } from "../../../hooks/render";
import { Col, ColumnHeader, ListingsTable, NFTCell } from "../../table";
import { OfferLoanModal, TakeLoanModal } from "../../form";
import { LoanSortCols, useLoanSortState, useSortedLoanOffers } from "./common";

const OFFER_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "duration", label: "Duration" },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanOffersProps {
  heading: string;
  offers?: LoanOfferPretty[];
}

export const LoanOffers = ({ heading, offers }: LoanOffersProps) => {
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [sortState, onSort] = useLoanSortState();
  const sortedOffers = useSortedLoanOffers(offers, sortState);

  return (
    <>
      <ListingsTable<LoanSortCols, LoanOffer>
        heading={heading}
        placeholder="No offers currently"
        action={
          <Button
            size="sm"
            leftIcon={<Icon as={IoAdd} />}
            onClick={() => setOfferModal(true)}
          >
            Offer Loan
          </Button>
        }
        cols={OFFER_COLS}
        items={sortedOffers}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th key={col.name}>{col.label}</Th>;
          }

          return (
            <ColumnHeader
              key={col.name}
              isNumeric={col.isNumeric}
              direction={sortState[0] === col.name ? sortState[1] : 0}
              onClick={() => onSort(col.name)}
            >
              {col.label}
            </ColumnHeader>
          );
        }}
        renderRow={(item) => (
          <LoanOfferRow
            key={item.address}
            offer={item}
            onSelect={() => setOffer(item)}
          />
        )}
      />
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
