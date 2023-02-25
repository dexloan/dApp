import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCash } from "react-icons/io5";

import { useNft } from "../../hooks/query";
import { AskLoanModal } from "../form";

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
