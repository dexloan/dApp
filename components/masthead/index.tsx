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
    <Box pt="8" pb="20">
      <Heading
        as="h1"
        size="2xl"
        color="gray.700"
        lineHeight="shorter"
        fontWeight="extrabold"
        maxW="16ch"
        mb="6"
      >
        <Box as="span" color="green.600">
          Borrow and lend
        </Box>{" "}
        against non-fungibles
      </Heading>
      <Text size="md" fontWeight="medium" mb="8">
        Unlock the value of your NFTs with free and secure lending
        <br />
        <Badge colorScheme="green">New: NFT rentals now available</Badge>
      </Text>
      <Box>
        <Button colorScheme="green" cursor="pointer" onClick={handleClick}>
          Get Started Today
        </Button>
      </Box>
    </Box>
  );
}
