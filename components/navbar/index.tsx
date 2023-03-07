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
import Image from "next/image";
import { useMemo } from "react";
import { IoWallet } from "react-icons/io5";
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

  function UserMenuButton() {
    return (
      <ButtonGroup spacing="0">
        {wallet.publicKey ? (
          <Menu>
            <MenuButton as={Button} size="sm" leftIcon={<Box as={IoWallet} />}>
              {displayAddress}
            </MenuButton>
            <MenuList borderRadius="sm">
              <MenuItem
                fontSize="sm"
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
      <Container maxW="container.xl">
        <Box
          as="nav"
          display="flex"
          h="16"
          flexDirection="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" flexDir="row" alignItems="center">
            <Box position="relative">
              <NextLink href="/">
                <a style={{ display: "inline-block", height: 25 }}>
                  <Image
                    src="/onda-logo.svg"
                    width={100}
                    height={25}
                    alt="onda logo"
                  />
                </a>
              </NextLink>
            </Box>

            <Box ml="6">
              <Box as="ul" display="flex" listStyleType="none">
                <NavItem href="/loans">Loans</NavItem>
                <NavItem href="/options">Call Options</NavItem>
                <NavItem disabled href="/rentals">
                  Rentals
                </NavItem>
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
  disabled?: boolean;
}

function NavItem({ href, children, disabled }: NavItemProps) {
  const { asPath } = useRouter();
  const isActive = asPath.includes(href);

  return (
    <Box as="li" ml="1">
      <NextLink href={href} passHref>
        <Button
          as="a"
          backgroundColor={isActive ? "rgba(255,255,255,0.1)" : "transparent"}
          color={isActive ? "gray.200" : undefined}
          _hover={
            !disabled
              ? {
                  backgroundColor: isActive
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  color: "gray.100",
                }
              : {}
          }
          _focus={
            !disabled
              ? {
                  outline: "none",
                  color: "gray.100",
                }
              : {}
          }
          cursor="pointer"
          size="sm"
          variant="ghost"
          disabled={disabled}
        >
          {children}
        </Button>
      </NextLink>
    </Box>
  );
}
