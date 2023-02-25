import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCalendar } from "react-icons/io5";

import { useNft } from "../../hooks/query";
import { AskCallOptionModal } from "../form";

interface CallOptionButtonProps {
  mint: anchor.web3.PublicKey;
  disabled?: boolean;
}

export const CallOptionButton = ({
  mint,
  disabled = false,
}: CallOptionButtonProps) => {
  const [modal, setModal] = useState(false);
  const query = useNft(mint);

  return (
    <>
      <Button
        w="100%"
        rightIcon={<IoCalendar />}
        disabled={disabled || !query.data}
        onClick={() => setModal(true)}
      >
        Sell call option
      </Button>
      <AskCallOptionModal
        open={modal}
        selected={query.data ?? null}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};
