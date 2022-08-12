import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { IoBicycle } from "react-icons/io5";

import { useHireAddressQuery, useHireQuery } from "../../hooks/query";
import { InitHireModal } from "../form";

interface HireButtonProps {
  mint: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const HireButton = ({ mint, disabled = false }: HireButtonProps) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button
        w="100%"
        rightIcon={<IoBicycle />}
        disabled={disabled}
        onClick={() => setModal(true)}
      >
        Rent NFT
      </Button>
      <InitHireModal
        open={modal}
        mint={mint}
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

  if (hireQuery.data) {
    return (
      <NextLink href={`/rental/${hireAddress.data?.toBase58()}`}>
        <Button w="100%">View Rental</Button>
      </NextLink>
    );
  }

  return <HireButton mint={mint} disabled={disabled} />;
};
