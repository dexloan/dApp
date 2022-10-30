import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState, useMemo } from "react";
import { IoBicycle } from "react-icons/io5";

import { HireStateEnum, NftResult } from "../../common/types";
import { Hire } from "../../common/model";
import { useHireAddressQuery, useHireQuery, useNFT } from "../../hooks/query";
import { InitHireModal } from "../form";

interface HireButtonProps {
  selected: NftResult | null;
  disabled?: boolean;
}

export const HireButton = ({ selected, disabled = false }: HireButtonProps) => {
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
      <InitHireModal
        open={modal}
        selected={selected}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};

interface SecondaryHireButtonProps {
  mint: anchor.web3.PublicKey;
  issuer: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const SecondaryHireButton = ({
  mint,
  issuer,
  disabled = false,
}: SecondaryHireButtonProps) => {
  const hireAddress = useHireAddressQuery(mint, issuer);
  const hireQuery = useHireQuery(hireAddress.data);
  const nftQuery = useNFT(mint);

  const hire = useMemo(() => {
    if (hireQuery.data) {
      return Hire.fromJSON(hireQuery.data);
    }
  }, [hireQuery.data]);

  if (hire && hire.state !== HireStateEnum.Cancelled) {
    return (
      <NextLink href={`/rental/${hireAddress.data?.toBase58()}`}>
        <Button w="100%">View Rental</Button>
      </NextLink>
    );
  }

  return <HireButton selected={nftQuery.data ?? null} disabled={disabled} />;
};
