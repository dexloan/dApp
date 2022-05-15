import * as anchor from "@project-serum/anchor";
import { Box, Image, LinkBox, LinkOverlay, Text } from "@chakra-ui/react";

interface SolscanLinks {
  mint?: anchor.web3.PublicKey;
}

export function ExternalLinks({ mint }: SolscanLinks) {
  return (
    <Box pt="6" pb="6">
      <LinkBox
        display="flex"
        flexDirection="row"
        alignItems="center"
        pt="2"
        pb="2"
        _active={{
          opacity: "0.4",
        }}
        _hover={{
          opacity: "0.6",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize="6"
        >
          <Image src="/solscan.png" alt="Solscan Logo" h="6" />
        </Box>
        <Text size="lg" fontWeight="semibold" pl="2">
          <LinkOverlay
            href={`https://solscan.io/token/${mint?.toBase58()}`}
            isExternal
          >
            View on Solscan
          </LinkOverlay>
        </Text>
      </LinkBox>
      <LinkBox
        display="flex"
        flexDirection="row"
        alignItems="center"
        pt="2"
        pb="2"
        _active={{
          opacity: "0.4",
        }}
        _hover={{
          opacity: "0.6",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxSize="6"
        >
          <Image src="/solana.png" alt="Solana Explorer Logo" h="4" />
        </Box>
        <Text size="lg" fontWeight="semibold" pl="2">
          <LinkOverlay
            href={`https://explorer.solana.com/address/${mint?.toBase58()}`}
            isExternal
          >
            View on Solana Explorer
          </LinkOverlay>
        </Text>
      </LinkBox>
    </Box>
  );
}
