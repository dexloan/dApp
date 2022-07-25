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
import { useEffect, useMemo, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert, IoList, IoCheckmark } from "react-icons/io5";

import * as utils from "../../common/utils";
import { CallOptionStateEnum } from "../../common/types";
import { RPC_ENDPOINT } from "../../common/constants";
import { CallOption } from "../../common/model";
import { fetchCallOption } from "../../common/query";
import {
  getCallOptionQueryKey,
  getMetadataFileCacheKey,
  useCallOptionQuery,
  useFloorPriceQuery,
  useMetadataFileQuery,
} from "../../hooks/query";
import {
  useBuyCallOptionMutation,
  useCloseCallOptionMutation,
  useExerciseCallOptionMutation,
} from "../../hooks/mutation";
import {
  BuyCallOptionDialog,
  ExerciseDialog,
  CloseCallOptionDialog,
} from "../../components/dialog";
import { Activity } from "../../components/activity";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { EllipsisProgress } from "../../components/progress";

interface CallOptionProps {
  dehydratedState: DehydratedState | undefined;
}

const CallOptionPage: NextPage<CallOptionProps> = (props) => {
  return (
    <>
      <CallOptionHead />
      <CallOptionLayout />
    </>
  );
};

CallOptionPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const queryClient = new QueryClient();

      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const loanAddress = new anchor.web3.PublicKey(ctx.query.loanId as string);

      const callOption = await queryClient.fetchQuery(
        getCallOptionQueryKey(loanAddress),
        () => fetchCallOption(connection, loanAddress)
      );

      await queryClient.prefetchQuery(
        getMetadataFileCacheKey(callOption.metadata.data.uri),
        () =>
          fetch(callOption.metadata.data.uri).then((response) => {
            return response.json().then((data) => data);
          })
      );

      return {
        dehydratedState: dehydrate(queryClient),
      };
    } catch (err) {
      console.log(err);
    }
  }

  return {
    dehydratedState: undefined,
  };
};

function usePageParam() {
  const router = useRouter();
  return useMemo(
    () => new anchor.web3.PublicKey(router.query.optionId as string),
    [router]
  );
}

const CallOptionHead = () => {
  const callOptionAddress = usePageParam();
  const callOptionQueryResult = useCallOptionQuery(callOptionAddress);
  const metadataQuery = useMetadataFileQuery(
    callOptionQueryResult.data?.metadata.data.uri
  );

  const callOption = useMemo(() => {
    if (callOptionQueryResult.data) {
      return CallOption.fromJSON(callOptionQueryResult.data);
    }
  }, [callOptionQueryResult.data]);

  const jsonMetadata = metadataQuery.data;

  if (!callOption || !jsonMetadata) {
    return null;
  }

  const description = `Call Option with strike price ${callOption.strikePrice} expiring ${callOption.expiry}`;

  return (
    <Head>
      <title>{callOption.metadata.data.name}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Dexloan" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"></link>
      <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />

      <meta property="og:title" content={callOption.metadata.data.name} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      <meta
        property="og:url"
        content={`https://dexloan.io/option/${callOption.publicKey.toBase58()}`}
      />
      <meta property="og:image" content={jsonMetadata.image} />

      <meta property="twitter:title" content={jsonMetadata.name} />
      <meta property="twitter:description" content={description} />
      <meta
        property="twitter:url"
        content={`https://dexloan.io/option/${callOption.publicKey.toBase58()}`}
      />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content={jsonMetadata.image} />
      <meta
        property="twitter:image:alt"
        content={callOption.metadata.data.name}
      />
      <meta property="twitter:label1" content="Strke Price" />
      <meta property="twitter:data1" content={callOption.strikePrice} />
      <meta property="twitter:label2" content="Cost" />
      <meta property="twitter:data2" content={callOption.cost} />
      <meta property="twitter:label3" content="Expiry" />
      <meta property="twitter:data3" content={callOption.expiry} />
    </Head>
  );
};

const CallOptionLayout = () => {
  const router = useRouter();
  const anchorWallet = useAnchorWallet();

  const callOptionAddress = new anchor.web3.PublicKey(
    router.query.optionId as string
  );

  const callOptionQueryResult = useCallOptionQuery(callOptionAddress);

  const symbol = callOptionQueryResult.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const callOption = useMemo(() => {
    if (callOptionQueryResult.data) {
      return CallOption.fromJSON(callOptionQueryResult.data);
    }
  }, [callOptionQueryResult.data]);

  const floorValue = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice));
    }
    return <EllipsisProgress />;
  }, [floorPriceQuery.data]);

  function renderListedButton() {
    if (callOption && callOption.isSeller(anchorWallet)) {
      return <CloseButton callOption={callOption} />;
    } else if (callOption && !callOption.expired) {
      return <BuyButton callOption={callOption} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (callOption && callOption.isSeller(anchorWallet)) {
      // TODO is this needed?
      return <CloseButton callOption={callOption} />;
    }

    return null;
  }

  function renderActiveButton() {
    if (!callOption) return null;

    if (!callOption.expired && callOption.isBuyer(anchorWallet)) {
      return <ExerciseButton callOption={callOption} />;
    }

    if (callOption.expired) {
      return renderCloseAccountButton();
    }
  }

  function renderByState() {
    if (callOption === undefined) return null;

    switch (callOption.state) {
      case CallOptionStateEnum.Listed:
        return (
          <>
            <Box display="flex" pb="4">
              {callOption?.expired ? (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Expired</TagLabel>
                </Tag>
              ) : (
                <Tag colorScheme="blue">
                  <TagLeftIcon boxSize="12px" as={IoList} />
                  <TagLabel>Listed</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
              <Text>
                {callOption?.expired
                  ? `This call option has now expired.${
                      callOption?.isSeller(anchorWallet)
                        ? " You may close the account to unlock the NFT."
                        : ""
                    }`
                  : `This NFT will remain locked until expiry on ${callOption.expiryLongFormat}, unless exercised.`}
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderListedButton()}
            </Box>
          </>
        );

      case CallOptionStateEnum.Active:
        return (
          <>
            <Box display="flex" pb="4">
              {callOption?.expired ? (
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
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
              <Text>
                {callOption?.expired
                  ? `This call option has now expired.${
                      callOption?.isSeller(anchorWallet)
                        ? " You may close the account to unlock the NFT."
                        : ""
                    }`
                  : callOption.isBuyer(anchorWallet)
                  ? `You may excersie this call option until expiry on ${callOption.expiryLongFormat}.`
                  : `This NFT will remain locked until expiry on ${callOption.expiryLongFormat}, unless exercised.`}
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderActiveButton()}
            </Box>
          </>
        );

      case CallOptionStateEnum.Exercised:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag colorScheme="blue">
                <TagLeftIcon boxSize="12px" as={IoCheckmark} />
                <TagLabel>Exercised</TagLabel>
              </Tag>
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
              <Text>
                Listing has ended.{" "}
                {callOption.isBuyer(anchorWallet)
                  ? "You exercised the call the option."
                  : "The call option was exercised by the buyer."}
              </Text>
            </Box>
            <Box marginY="size-200">{renderCloseAccountButton()}</Box>
          </>
        );

      case CallOptionStateEnum.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Call option account closed.</Text>
            </Box>
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
          <ListingImage uri={callOption?.metadata.data.uri} />
          <ExternalLinks mint={callOption?.data.mint} />
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Call Option
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {callOption?.metadata.data.name}
          </Heading>
          <Box mb="8">
            <VerifiedCollection symbol={callOption?.metadata.data.symbol} />
          </Box>

          {callOption && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Cost
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.cost}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Expires
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.expiry}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Strike Price
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {callOption.strikePrice}
                  </Heading>
                </Box>
              </Flex>
              <Flex direction="row" gap="12" mb="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Floor Value
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {floorValue}
                  </Heading>
                </Box>
              </Flex>
            </>
          )}

          {renderByState()}

          <Activity mint={callOption?.data.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface BuyButtonProps {
  callOption: CallOption;
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
        Buy Call Option
      </Button>
      <BuyCallOptionDialog
        open={open}
        loading={mutation.isLoading}
        callOption={callOption}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(callOption.data)}
      />
    </>
  );
};

interface CloseButtonProps {
  callOption: CallOption;
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
        {callOption.expired ? "Close Account" : "Close Option"}
      </Button>
      <CloseCallOptionDialog
        open={dialog}
        loading={mutation.isLoading}
        callOption={callOption}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(callOption.data)}
      />
    </>
  );
};

interface ExerciseButtonProps {
  callOption: CallOption;
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
      <ExerciseDialog
        open={dialog}
        loading={mutation.isLoading}
        callOption={callOption}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({ ...callOption.data, metadata: callOption.metadata })
        }
      />
    </>
  );
};

export default CallOptionPage;
