import type { AppProps } from "next/app";
import { ChakraProvider, Box, Input, Heading, Text } from "@chakra-ui/react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/router";
import { useMemo } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import "@solana/wallet-adapter-react-ui/styles.css";

import DexloanLogo from "../public/dexloan.svg";
import theme from "../theme";
import { RPC_ENDPOINT } from "../common/constants";
import { FontFace } from "../components/font";
import { Navbar } from "../components/navbar";
import { Main } from "../components/layout";
import { DocumentHead } from "../components/document";

function Dexloan({ Component, pageProps }: AppProps) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    []
  );

  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { refetchOnWindowFocus: false, retry: false },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <ConnectionProvider endpoint={RPC_ENDPOINT}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <ChakraProvider theme={theme}>
                <DocumentHead
                  title="Dexloan | Borrow and lend against NFTs on Solana"
                  description="Dexloan is a DeFi protocol on the Solana blockchain for escrowless NFT borrowing &amp; lending. Users can take loans by collateralizing their NFT and simultaneously rent out the same NFT to earn passive income. We also support call options and (coming soon) NFT &amp; SOL staking."
                  url={``}
                />
                <LaunchPlaceholder>
                  <>
                    <Navbar />
                    <Component {...pageProps} />
                    <Toaster />
                  </>
                </LaunchPlaceholder>
                <FontFace />
              </ChakraProvider>
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </Hydrate>
    </QueryClientProvider>
  );
}

const LaunchPlaceholder = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();

  return (
    <Main>
      <Box
        height="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <Box width="200px" mb="6">
          <DexloanLogo />
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Heading
            as="h1"
            size="2xl"
            color="gray.700"
            lineHeight="shorter"
            fontWeight="extrabold"
            maxW="16ch"
            mb="8"
            textAlign="center"
          >
            <Box as="span" color="green.600">
              Borrow and lend
            </Box>{" "}
            against your digital assets
          </Heading>
          <Text
            size="md"
            fontWeight="medium"
            mb="8"
            maxW="60ch"
            textAlign="center"
          >
            Dexloan is now onboarding a select number of communities for early
            access to our financial &amp; social NFT services. Please reach out
            to us <Text as="b">@dexloanio</Text> if you are part of a community
            interested in using our services.
          </Text>
        </Box>
        <Box width="400px">
          <Input placeholder="Enter Password" />
        </Box>
      </Box>
    </Main>
  );

  // return children;
};

export default Dexloan;
