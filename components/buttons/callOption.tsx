import * as anchor from "@project-serum/anchor";
import { Button } from "@chakra-ui/react";
import { useState } from "react";
import { IoCalendar } from "react-icons/io5";

import { useNFT } from "../../hooks/query";
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
  const nftQuery = useNFT(mint);

  return (
    <>
      <Button
        w="100%"
        rightIcon={<IoCalendar />}
        disabled={disabled || !nftQuery.data}
        onClick={() => setModal(true)}
      >
        Sell call option
      </Button>
      <AskCallOptionModal
        open={modal}
        selected={nftQuery.data ?? null}
        onRequestClose={() => setModal(false)}
      />
    </>
  );
};
