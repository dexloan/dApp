import { Button, Box, Container } from "@chakra-ui/react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { useMemo } from "react";
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
          <Link href="/">
            <a>
              <Dexloan width="200px" />
            </a>
          </Link>
        </Box>
        <Box>
          <Button onClick={onConnect}>
            {wallet.publicKey ? displayAddress : "Connect Wallet"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
