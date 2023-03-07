import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
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
import { useMemo } from "react";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import "@solana/wallet-adapter-react-ui/styles.css";

import theme from "../theme";
import { FontFace } from "../components/font";
import { Navbar } from "../components/navbar";
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
        <ConnectionProvider
          endpoint={process.env.NEXT_PUBLIC_RPC_ENDPOINT as string}
          config={{
            commitment: "confirmed",
            confirmTransactionInitialTimeout: 90_000,
          }}
        >
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <ChakraProvider theme={theme}>
                <DocumentHead
                  title="Onda | The utility layer for NFT communities"
                  description="Onda is a DeFi protocol on the Solana blockchain for escrowless NFT borrowing &amp; lending, call options and social staking. Users can take loans by collateralizing their NFT and simultaneously rent out the same NFT to earn passive income."
                  url={``}
                />
                <Navbar />
                <Component {...pageProps} />
                <Toaster />
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

export default Dexloan;
