import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState, useMemo } from "react";
import { IoBicycle } from "react-icons/io5";

import { RentalStateEnum, NftResult } from "../../common/types";
import { Rental } from "../../common/model";
import {
  useRentalAddressQuery,
  useRentalQuery,
  useNft,
} from "../../hooks/query";
// import { InitRentalModal } from "../form";

interface RentalButtonProps {
  selected: NftResult | null;
  disabled?: boolean;
}

export const RentalButton = ({
  selected,
  disabled = false,
}: RentalButtonProps) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button
        w="100%"
        rightIcon={<IoBicycle />}
        disabled={disabled || !selected}
        onClick={() => setModal(true)}
      >
        Rent NFT
      </Button>
      {/* <InitRentalModal
        open={modal}
        selected={selected}
        onRequestClose={() => setModal(false)}
      /> */}
    </>
  );
};

interface SecondaryRentalButtonProps {
  mint: anchor.web3.PublicKey;
  issuer: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const SecondaryRentalButton = ({
  mint,
  issuer,
  disabled = false,
}: SecondaryRentalButtonProps) => {
  const hireAddress = useRentalAddressQuery(mint, issuer);
  const hireQuery = useRentalQuery(hireAddress.data);
  const nftQuery = useNft(mint);

  const rental = useMemo(() => {
    if (hireQuery.data) {
      return Rental.fromJSON(hireQuery.data);
    }
  }, [hireQuery.data]);

  // if (rental && rental.state !== RentalStateEnum.Cancelled) {
  //   return (
  //     <NextLink href={`/rental/${hireAddress.data?.toBase58()}`}>
  //       <Button w="100%">View Rental</Button>
  //     </NextLink>
  //   );
  // }

  return <RentalButton selected={nftQuery.data ?? null} disabled={disabled} />;
};
