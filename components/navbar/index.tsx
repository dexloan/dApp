import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import NextLink from "next/link";
import { useEffect, useMemo } from "react";
import { IoWallet } from "react-icons/io5";
import toast from "react-hot-toast";
import base58 from "bs58";

import Dexloan from "../../public/dexloan.svg";

export function Navbar() {
  const modal = useWalletModal();
  const wallet = useWallet();

  const displayAddress = useMemo(() => {
    if (wallet.publicKey) {
      const base58 = wallet.publicKey.toBase58();
      return base58.slice(0, 4) + "..." + base58.slice(-4);
    }
  }, [wallet]);

  function onConnect() {
    modal.setVisible(true);
  }

  useEffect(() => {
    async function signMessage() {
      if (!wallet.signMessage) return;

      try {
        const message = process.env.NEXT_PUBLIC_AUTH_MESSAGE as string;
        const signature = await wallet.signMessage(
          Buffer.from(message, "utf8")
        );
        const encodedSignature = base58.encode(signature);

        const response = await fetch("/api/authenticate", {
          method: "POST",
          body: JSON.stringify({
            signature: encodedSignature,
            publicKey: wallet.publicKey?.toBase58(),
          }),
        });
        const body = await response.json();

        if (!response.ok) {
          throw new Error(body.message ?? "Failed to verify");
        }
      } catch (error) {
        toast.error("Failed to verify");
        try {
          await wallet.disconnect();
        } catch {}
      }
    }

    if (wallet.publicKey) {
      signMessage();
    }
  }, [wallet.publicKey]);

  function UserMenuButton() {
    return (
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
        {wallet.publicKey ? (
          <Menu>
            <MenuButton as={Button} borderLeftRadius="none">
              {displayAddress}
            </MenuButton>
            <MenuList>
              <NextLink href="/manage">
                <MenuItem>My Items</MenuItem>
              </NextLink>

              <MenuItem
                onClick={async () => {
                  try {
                    await wallet.disconnect();
                  } catch {
                    // nada
                  }
                }}
              >
                Disconnect
              </MenuItem>
            </MenuList>
          </Menu>
        ) : (
          <Button onClick={onConnect}>Connect Wallet</Button>
        )}
      </ButtonGroup>
    );
  }

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
          <UserMenuButton />
        </Flex>
      </Box>
    </Container>
  );
}
