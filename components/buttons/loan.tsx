import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCash } from "react-icons/io5";
import { InitLoanModal } from "../form";

interface LoanButtonProps {
  mint: anchor.web3.PublicKey;
  symbol: string;
  disabled?: boolean;
}

export const LoanButton = ({
  mint,
  symbol,
  disabled = false,
}: LoanButtonProps) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button
        w="100%"
        disabled={disabled}
        rightIcon={<IoCash />}
        onClick={() => setModal(true)}
      >
        Borrow against
      </Button>
      <InitLoanModal
        open={modal}
        mint={mint}
        symbol={symbol}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};
