import * as anchor from "@project-serum/anchor";
import { Button, ButtonGroup } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { IoCash } from "react-icons/io5";

import { useNft } from "../../hooks/query";
import { AskLoanModal } from "../form";
import { useRouter } from "next/router";

interface LoanButtonProps {
  mint: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const LoanButton = ({ mint, disabled = false }: LoanButtonProps) => {
  const [modal, setModal] = useState(false);
  const nftQuery = useNft(mint);

  return (
    <>
      <Button
        w="100%"
        disabled={disabled || !nftQuery.data}
        rightIcon={<IoCash />}
        onClick={() => setModal(true)}
      >
        Borrow against
      </Button>
      <AskLoanModal
        open={modal}
        selected={nftQuery.data ?? null}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};

export const LoanLinks = () => {
  const router = useRouter();

  return (
    <ButtonGroup isAttached size="sm" variant="outline">
      <NextLink href="/loans">
        <Button
          as="a"
          cursor="pointer"
          borderRightRadius="0"
          bgColor={router.pathname === "/loans" ? "gray.800" : undefined}
        >
          Asks
        </Button>
      </NextLink>
      <NextLink href="/loans/offers">
        <Button
          as="a"
          cursor="pointer"
          borderLeft="0"
          borderRight="0"
          borderRadius="0"
          bgColor={router.pathname === "/loans/offers" ? "gray.800" : undefined}
        >
          Offers
        </Button>
      </NextLink>
      <NextLink href="/loans/me">
        <Button
          as="a"
          cursor="pointer"
          borderLeftRadius="0"
          bgColor={router.pathname === "/loans/me" ? "gray.800" : undefined}
        >
          My Items
        </Button>
      </NextLink>
    </ButtonGroup>
  );
};
