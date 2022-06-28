import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Badge,
  Button,
  Container,
  Heading,
  Flex,
  Box,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoLeaf, IoAlert } from "react-icons/io5";

import * as utils from "../../utils";
import { RPC_ENDPOINT, CallOptionState } from "../../common/constants";
import { CallOptionResult } from "../../common/types";
import { fetchCallOption } from "../../common/query";
import { useCallOptionQuery, useFloorPriceQuery } from "../../hooks/query";
import {
  useBuyCallOptionMutation,
  useCloseCallOptionMutation,
  useExerciseCallOptionMutation,
} from "../../hooks/mutation";
import { CancelDialog, LoanDialog, RepayDialog } from "../../components/dialog";
import { Activity } from "../../components/activity";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { EllipsisProgress } from "../../components/progress";

interface CallOptionProps {
  initialData: {
    callOption: {
      publicKey: any;
      data: any;
      metadata: any;
    };
    jsonMetadata: any;
  } | null;
}

const CallOptionPage: NextPage<CallOptionProps> = (props) => {
  return (
    <>
      <CallOptionHead {...props} />
      <CallOptionLayout />
    </>
  );
};

CallOptionPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const pubkey = new anchor.web3.PublicKey(ctx.query.optionId as string);
      const result = await fetchCallOption(connection, pubkey);
      const jsonMetadata = await fetch(result.metadata.data.uri).then(
        (response) => {
          return response.json().then((data) => data);
        }
      );

      return {
        initialData: {
          callOption: {
            publicKey: result.publicKey.toBase58(),
            data: {
              ...result.data,
              amount: result.data.amount.toNumber(),
              seller: result.data.seller.toBase58(),
              buyer: result.data.buyer.toBase58(),
              expiry: result.data.expiry.toNumber(),
              strikePrice: result.data.strikePrice.toNumber(),
              escrow: result.data.escrow.toBase58(),
              mint: result.data.mint.toBase58(),
            },
            metadata: result.metadata.pretty(),
          },
          jsonMetadata,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  return {
    initialData: null,
    meta: null,
  };
};

const CallOptionHead = ({ initialData }: CallOptionProps) => {
  if (initialData) {
    const description = `Borrowring ${utils.formatAmount(
      new anchor.BN(initialData.callOption.data.amount)
    )} over ${utils.formatDuration(
      new anchor.BN(initialData.callOption.data.duration)
    )}`;

    return (
      <Head>
        <title>{initialData.callOption.metadata.data.name}</title>
        <meta name="description" content={description} />
        <meta name="author" content="Dexloan" />
        <link
          rel="shortcut icon"
          type="image/x-icon"
          href="/favicon.ico"
        ></link>
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />

        <meta property="og:title" content={initialData.jsonMetadata.name} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={description} />
        <meta
          property="og:url"
          content={`https://dexloan.io/option/${initialData.callOption.publicKey}`}
        />
        <meta property="og:image" content={initialData.jsonMetadata.image} />

        <meta
          property="twitter:title"
          content={initialData.jsonMetadata.name}
        />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={`https://dexloan.io/option/${initialData.callOption.publicKey}`}
        />
        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:image"
          content={initialData.jsonMetadata.image}
        />
        <meta
          property="twitter:image:alt"
          content={initialData.jsonMetadata.name}
        />
        <meta property="twitter:label1" content="Amount" />
        <meta
          property="twitter:data1"
          content={utils.formatAmount(
            new anchor.BN(initialData.callOption.data.amount)
          )}
        />
        <meta property="twitter:label2" content="APY" />
        <meta
          property="twitter:data2"
          content={initialData.callOption.data.basisPoints / 100 + "%"}
        />
        <meta property="twitter:label3" content="Duration" />
        <meta
          property="twitter:data3"
          content={utils.formatDuration(
            new anchor.BN(initialData.callOption.data.duration)
          )}
        />
      </Head>
    );
  }

  return null;
};

const CallOptionLayout = () => {
  const router = useRouter();
  const anchorWallet = useAnchorWallet();

  const callOptionAddress = new anchor.web3.PublicKey(
    router.query.listingId as string
  );
  const callOptionQueryResult = useCallOptionQuery(callOptionAddress);

  const symbol = callOptionQueryResult.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const callOption = callOptionQueryResult.data?.data;
  const metadata = callOptionQueryResult.data?.metadata;

  const hasExpired = false; // TODO

  const isSeller =
    callOption &&
    callOption.seller.toBase58() === anchorWallet?.publicKey.toBase58();
  const isBuyer =
    callOption &&
    callOption.buyer.toBase58() === anchorWallet?.publicKey.toBase58();

  function renderActiveButton() {
    if (!hasExpired && callOption && isBuyer) {
      return <ExerciseOption callOption={callOption} />;
    }

    return null;
  }

  function renderListedButton() {
    if (callOption && isSeller) {
      return <CancelButton callOption={callOption} />;
    } else if (callOption) {
      return <BuyButton callOption={callOption} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (callOption && isSeller) {
      // TODO is this needed?
      return <CloseAccountButton callOption={callOption} />;
    }

    return null;
  }

  function renderProfitability() {
    if (callOption?.strikePrice && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (callOption.strikePrice.toNumber() / floorPriceQuery.data.floorPrice) *
          100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }

  function renderByState() {
    if (callOption === undefined) return null;

    switch (callOption.state) {
      case CallOptionState.Listed:
        return (
          <Box mt="4" mb="4">
            {renderListedButton()}
          </Box>
        );

      case CallOptionState.Active:
        return (
          <>
            <Box display="flex" pb="4">
              {hasExpired ? (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Expired</TagLabel>
                </Tag>
              ) : (
                <Tag colorScheme="green">
                  <TagLeftIcon boxSize="12px" as={IoLeaf} />
                  <TagLabel>Active</TagLabel>
                </Tag>
              )}
            </Box>
            <Box mt="4" mb="4">
              {renderActiveButton()}
            </Box>
          </>
        );

      case CallOptionState.Exercised:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
              <Text>
                Listing has ended. The call option was exercised by the buyer.
              </Text>
            </Box>
            <Box marginY="size-200">{renderCloseAccountButton()}</Box>
          </>
        );

      default:
        return null;
    }
  }

  if (callOptionQueryResult.isLoading) {
    // TODO skeleton
    return null;
  }

  if (callOptionQueryResult.error instanceof Error) {
    return (
      <Container maxW="container.lg">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">{callOptionQueryResult.error.message}</Text>
          </Flex>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW={{ md: "container.md", lg: "container.xl" }}>
      <Flex
        direction={{
          base: "column",
          lg: "row",
        }}
        align={{
          base: "center",
          lg: "flex-start",
        }}
        wrap="wrap"
      >
        <Box w={{ base: "100%", lg: "auto" }} maxW={{ base: "xl", lg: "100%" }}>
          <ListingImage uri={metadata?.data.uri} />
          <ExternalLinks mint={callOption?.mint} />
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Peer-to-peer Listing
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {metadata?.data.name}
          </Heading>
          <Box mb="8">
            <VerifiedCollection symbol={metadata?.data.symbol} />
          </Box>

          {callOption && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Cost
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.amount.toNumber()}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Expires
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.expiry.toNumber()}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Strike Price
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.strikePrice.toNumber()}
                  </Heading>
                </Box>
              </Flex>
            </>
          )}

          {renderByState()}

          <Activity mint={callOption?.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface BuyButtonProps {
  callOption: CallOptionResult;
}

const BuyButton = ({ callOption }: BuyButtonProps) => {
  const [open, setDialog] = useState(false);
  const mutation = useBuyCallOptionMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onLend() {
    if (anchorWallet) {
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <Button colorScheme="green" w="100%" onClick={onLend}>
        Lend SOL
      </Button>
      <LoanDialog
        open={open}
        loading={mutation.isLoading}
        amount={amount}
        duration={duration}
        basisPoints={basisPoints}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            mint,
            borrower,
            listing,
          })
        }
      />
    </>
  );
};

interface CloseButtonProps {
  callOption: CallOptionResult;
}

const CloseButton = ({ callOption }: CloseButtonProps) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseCallOptionMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onCancel() {
    if (anchorWallet) {
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <Button colorScheme="blue" w="100%" onClick={onCancel}>
        Close Option
      </Button>
      <CancelDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate({ mint, escrow, listing })}
      />
    </>
  );
};

interface ExerciseButtonProps {
  callOption: CallOptionResult;
}

const ExerciseButton = ({ callOption }: ExerciseButtonProps) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useExerciseCallOptionMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onRepay() {
    if (anchorWallet) {
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  useEffect(() => {
    if (mutation.isSuccess) {
      router.replace("/manage");
    }
  }, [router, mutation.isSuccess]);

  return (
    <>
      <Button colorScheme="blue" w="100%" onClick={onRepay}>
        Exercise Call Option
      </Button>
      <RepayDialog
        open={dialog}
        loading={mutation.isLoading}
        amount={amount}
        basisPoints={basisPoints}
        duration={duration}
        startDate={startDate}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            mint,
            lender,
          })
        }
      />
    </>
  );
};

export default CallOptionPage;
