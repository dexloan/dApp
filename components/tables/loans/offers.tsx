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
  offers?: LoanOfferPretty[];
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
      <ListingsTable<LoanSortCols, LoanOffer>
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
        renderRow={(item) => (
          <LoanRow
            key={item.address}
            loan={item}
            onClick={() => {
              if (!wallet.publicKey) {
                modal.setVisible(true);
              }

              setOffer(item);
            }}
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

// interface LoanOfferRowProps {
//   offer: LoanOffer;
//   onSelect: () => void;
// }

// const LoanOfferRow = ({ offer, onSelect }: LoanOfferRowProps) => {
//   const collectionQuery = useCollectionQuery(offer.data.collection);
//   const floorPriceQuery = useFloorPriceQuery(offer?.metadata.data.symbol);

//   const floorPrice = useMemo(() => {
//     if (floorPriceQuery.data?.floorPrice) {
//       return floorPriceQuery.data.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
//     }
//   }, [floorPriceQuery.data]);

//   const ltv = useLTV(offer?.data.amount, floorPriceQuery.data?.floorPrice);

//   const collectionConfig = collectionQuery.data?.data
//     .config as CollectionConfig;
//   const creatorApy = collectionConfig
//     ? collectionConfig.loanBasisPoints === 0
//       ? 0
//       : collectionConfig.loanBasisPoints / 100
//     : undefined;

//   const offerApy =
//     offer.data.basisPoints === 0 ? 0 : offer.data.basisPoints / 100;

//   return (
//     <LoanRow
//       amount={offer.amount}
//       duration={offer.duration}
//       apy={creatorApy ? offerApy + creatorApy + "%" : "..."}
//       lenderApy={offer.apy}
//       creatorApy={creatorApy ? creatorApy + "%" : "..."}
//       ltv={ltv}
//       floorPriceSol={floorPrice}
//       metadata={offer.metadata}
//       onClick={onSelect}
//     />
//   );
// };
