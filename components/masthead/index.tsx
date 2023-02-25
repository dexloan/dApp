import { Badge, Box, Button, Heading, Text } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useEffect, useRef } from "react";
import { useRouter } from "next/router";

export function Masthead() {
  const router = useRouter();
  const wallet = useWallet();
  const { setVisible } = useWalletModal();
  const redirectRef = useRef(false);

  function handleClick() {
    if (!wallet.publicKey) {
      setVisible(true);
      // Redirect on connect
      redirectRef.current = true;
    } else {
      router.push("/manage");
    }
  }

  useEffect(() => {
    if (wallet.publicKey && redirectRef.current) {
      redirectRef.current = false;
      router.push("/manage");
    }
  }, [router, wallet.publicKey]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      textAlign="center"
      alignItems="center"
      py="20"
    >
      <Heading
        as="h1"
        size="3xl"
        lineHeight="normal"
        fontWeight="extrabold"
        maxW="16ch"
        mb="6"
      >
        Do more with your non-fungibles
      </Heading>
      <Text
        fontSize="lg"
        fontWeight="medium"
        color="gray.400"
        mb="8"
        maxW="50ch"
      >
        Unlock the value of your NFTs with escrowless finacial contracts and
        social staking. Borrow and lend. Buy and sell call options. Rent and
        stake.
      </Text>
    </Box>
  );
}
