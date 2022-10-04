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
import { useRouter } from "next/router";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              size="sm"
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
          <Button onClick={onConnect} size="sm">
            Connect Wallet
          </Button>
        )}
      </ButtonGroup>
    );
  }

  return (
    <Box display="flex" borderBottomWidth="1px" borderColor="gray.800">
      <Container maxW="container.lg">
        <Box
          as="nav"
          display="flex"
          h="16"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box>
            <Box>
              <NextLink href="/">
                <a>{/* LOGO GOES HERE */}</a>
              </NextLink>
            </Box>

            <Box>
              <Box as="ul" display="flex" listStyleType="none">
                <NavItem href="/loans">Loans</NavItem>
                <NavItem href="/options">Call Options</NavItem>
                <NavItem href="/rentals">Rentals</NavItem>
              </Box>
            </Box>
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
    </Box>
  );
}

interface NavItemProps {
  href: string;
  children: string;
}

function NavItem({ href, children }: NavItemProps) {
  const { asPath } = useRouter();
  const isActive = asPath === href;

  return (
    <Box as="li">
      <NextLink href={href} passHref>
        <Button
          as="a"
          backgroundColor={isActive ? "rgba(255,255,255,0.1)" : "transparent"}
          _hover={{
            backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
            color: "gray.100",
          }}
          cursor="pointer"
          size="sm"
          variant="ghost"
        >
          {children}
        </Button>
      </NextLink>
    </Box>
  );
}
