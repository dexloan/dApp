import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCalendar } from "react-icons/io5";

import { InitCallOptionModal } from "../form";

interface LoanButtonProps {
  mint: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const CallOptionButton = ({
  mint,
  disabled = false,
}: LoanButtonProps) => {
  const [modal, setModal] = useState(false);

  return (
    <>
      <Button
        w="100%"
        rightIcon={<IoCalendar />}
        disabled={disabled}
        onClick={() => setModal(true)}
      >
        Sell call option
      </Button>
      <InitCallOptionModal
        open={modal}
        mint={mint}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};
