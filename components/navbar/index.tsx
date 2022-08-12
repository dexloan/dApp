import { Box, Button, ButtonGroup, Container, Flex } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";
import { useMemo } from "react";
import { IoWallet } from "react-icons/io5";
import Dexloan from "../../public/dexloan.svg";

export function Navbar() {
  const modal = useWalletModal();
  const wallet = useWallet();

  async function onConnect() {
    if (wallet.publicKey) {
      try {
        await wallet.disconnect();
      } catch {}
    } else {
      modal.setVisible(true);
    }
  }

  const displayAddress = useMemo(() => {
    if (wallet.publicKey) {
      const base58 = wallet.publicKey.toBase58();
      return base58.slice(0, 4) + "..." + base58.slice(-4);
    }
  }, [wallet]);

  return (
    <Container maxW="container.xl">
      <Box
        as="nav"
        borderBottomWidth="1px"
        borderColor="gray.200"
        display="flex"
        h="28"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb="10"
      >
        <Box>
          <NextLink href="/">
            <a>
              <Dexloan width="168px" />
            </a>
          </NextLink>
        </Box>

        <Flex align="center">
          {/* <Flex pr="6">
            <NextLink href="/help">
              <Button variant="link">Help</Button>
            </NextLink>
          </Flex> */}

          <ButtonGroup spacing="0">
            {wallet.publicKey && (
              <NextLink href="/manage">
                <Button
                  as="a"
                  borderRightRadius="0"
                  borderRightWidth="thin"
                  borderColor="gray.200"
                  cursor="pointer"
                  px="0.25"
                >
                  <Box as={IoWallet} />
                </Button>
              </NextLink>
            )}
            <Button
              onClick={onConnect}
              borderLeftRadius={wallet.publicKey ? "none" : undefined}
            >
              {wallet.publicKey ? displayAddress : "Connect Wallet"}
            </Button>
          </ButtonGroup>
        </Flex>
      </Box>
    </Container>
  );
}
