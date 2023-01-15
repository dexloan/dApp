import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button, Icon, Th } from "@chakra-ui/react";
import { IoAdd } from "react-icons/io5";
import { useState } from "react";

import { GroupedLoanOfferJson, LoanOfferJson } from "../../../common/types";
import { Col, ColumnHeader, LTVHeader, ListingsTable } from "../../table";
import { OfferLoanModal, TakeLoanModal } from "../../form";
import { LoanRow, LoanSortCols, useLoanSortState } from "./common";

const OFFER_COLS: Readonly<Col<LoanSortCols>[]> = [
  { name: "collection", label: "Collection" },
  { name: "duration", label: "Duration", isNumeric: true },
  { name: "apy", label: "APY", isNumeric: true },
  { name: "ltv", label: "LTV", isNumeric: true },
  { name: "amount", label: "Amount", isNumeric: true },
] as const;

interface LoanOffersProps {
  heading: string;
  offers?: GroupedLoanOfferJson[];
}

export const LoanOffers = ({ heading, offers }: LoanOffersProps) => {
  const wallet = useWallet();
  const modal = useWalletModal();
  const [offerModal, setOfferModal] = useState<boolean>(false);
  const [offer, setOffer] = useState<GroupedLoanOfferJson | null>(null);
  const [sortState, onSort] = useLoanSortState();

  return (
    <>
      <ListingsTable<LoanSortCols, GroupedLoanOfferJson>
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

          if (col.name === "ltv") {
            return <LTVHeader />;
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
              key={`${item.Collection.address}_${item.amount}_${item.duration}_${item.basisPoints}`}
              item={item}
              subtitle={`${item._count} Offer${item._count > 1 ? "s" : ""}`}
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
      <OfferLoanModal
        open={offerModal}
        onRequestClose={() => setOfferModal(false)}
      />
      <TakeLoanModal
        groupedOffer={offer}
        open={Boolean(offer)}
        onRequestClose={() => setOffer(null)}
      />
    </>
  );
};
