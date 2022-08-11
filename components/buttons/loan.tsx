import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCash } from "react-icons/io5";
import { NFTResult } from "../../common/types";
import { InitLoanModal } from "../form";

interface LoanButtonProps {
  mint: anchor.web3.PublicKey;
  depositTokenAccount: anchor.web3.PublicKey;
  symbol: string;
}

export const LoanButton = ({
  mint,
  depositTokenAccount,
  symbol,
}: LoanButtonProps) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button w="100%" rightIcon={<IoCash />} onClick={() => setModal(true)}>
        Borrow against
      </Button>
      <InitLoanModal
        open={modal}
        mint={mint}
        depositTokenAccount={depositTokenAccount}
        symbol={symbol}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};
