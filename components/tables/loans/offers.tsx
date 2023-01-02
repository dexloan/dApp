import { useWallet } from "@solana/wallet-adapter-react";
import { Button, Icon, Th } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";

import { LoanOffer, LoanOfferPretty } from "../../../common/model";
import { Col, ColumnHeader, ListingsTable } from "../../table";
import { OfferLoanModal, TakeLoanModal } from "../../form";
import {
  LoanRow,
  LoanSortCols,
  useLoanSortState,
  useSortedLoanOffers,
} from "./common";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

const OFFER_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "duration", label: "Duration" },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanOffersProps {
  heading: string;
  offers?: LoanOfferPretty[][];
}

export const LoanOffers = ({ heading, offers }: LoanOffersProps) => {
  const wallet = useWallet();
  const modal = useWalletModal();
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<LoanOffer | null>(null);
  const [sortState, onSort] = useLoanSortState();
  const sortedOffers = useSortedLoanOffers(offers, sortState);

  return (
    <>
      <ListingsTable<LoanSortCols, LoanOfferPretty[]>
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
        renderRow={(items) => {
          const loanOffer = LoanOffer.fromJSON(items[0]);
          return (
            <LoanRow
              key={loanOffer.address}
              loan={loanOffer}
              subtitle={`${items.length} Offer${items.length > 1 ? "s" : ""}`}
              onClick={() => {
                if (!wallet.publicKey) {
                  modal.setVisible(true);
                }

                setOffer(loanOffer);
              }}
            />
          );
        }}
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
