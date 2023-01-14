import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button, Icon, Th } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";

import { LoanOfferJson } from "../../../common/types";
import { LoanOffer, LoanOfferPretty } from "../../../common/model";
import { Col, ColumnHeader, ListingsTable } from "../../table";
import { OfferLoanModal, TakeLoanModal } from "../../form";
import { LoanRow, LoanSortCols, useLoanSortState } from "./common";

const OFFER_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "duration", label: "Duration" },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanOffersProps {
  heading: string;
  offers?: LoanOfferJson[];
}

export const LoanOffers = ({ heading, offers }: LoanOffersProps) => {
  const wallet = useWallet();
  const modal = useWalletModal();
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<LoanOfferJson | null>(null);
  const [sortState, onSort] = useLoanSortState();

  return (
    <>
      <ListingsTable<LoanSortCols, LoanOfferJson>
        heading={heading}
        placeholder="No offers currently"
        action={
          <Button
            size="sm"
            leftIcon={<Icon as={IoAdd} />}
            isDisabled={!wallet.publicKey}
            onClick={() => setOfferModal(true)}
          >
            Offer Loan
          </Button>
        }
        cols={OFFER_COLS}
        items={offers}
        renderCol={(col) => {
          if (col.name === "collection") {
            return <Th key={col.name}>{col.label}</Th>;
          }

          return (
            <ColumnHeader
              key={col.name}
              isNumeric={col.isNumeric}
              direction={sortState[0] === col.name ? sortState[1] : undefined}
              onClick={() => onSort(col.name)}
            >
              {col.label}
            </ColumnHeader>
          );
        }}
        renderRow={(item) => {
          return (
            <LoanRow
              key={item.address}
              item={item}
              subtitle={`1 Offer${0 > 1 ? "s" : ""}`}
              onClick={() => {
                if (!wallet.publicKey) {
                  modal.setVisible(true);
                }
                setOffer(item);
              }}
            />
          );
        }}
      />
      {/* <OfferLoanModal
        open={offerModal}
        onRequestClose={() => setOfferModal(false)}
      /> */}
      {/* <TakeLoanModal
        offer={offer}
        open={Boolean(offer)}
        onRequestClose={() => setOffer(null)}
      /> */}
    </>
  );
};
