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
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert, IoList, IoCheckmark } from "react-icons/io5";

import * as utils from "../../common/utils";
import { CallOptionStateEnum } from "../../common/types";
import { CallOption } from "../../common/model";
import { fetchCallOption } from "../../common/query";
import {
  getCallOptionCacheKey,
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
import { Detail } from "../../components/detail";
import { EllipsisProgress } from "../../components/progress";
import { NftLayout } from "../../components/layout";
import { DocumentHead } from "../../components/document";

interface CallOptionProps {
  dehydratedState: DehydratedState | undefined;
}

const CallOptionPage: NextPage<CallOptionProps> = () => {
  const callOptionAddress = usePageParam();
  const callOptionQueryResult = useCallOptionQuery(callOptionAddress);
  const metadataQuery = useMetadataFileQuery(
    callOptionQueryResult.data?.metadata.data.uri
  );
  const jsonMetadata = metadataQuery.data;

  const callOption = useMemo(() => {
    if (callOptionQueryResult.data) {
      return CallOption.fromJSON(callOptionQueryResult.data);
    }
  }, [callOptionQueryResult.data]);

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

  if (!callOption || !jsonMetadata) {
    return null;
  }

  return (
    <>
      <DocumentHead
        title={callOption.metadata.data.name}
        description={`Call Option with strike price ${callOption.strikePrice} expiring ${callOption.expiry}`}
        image={jsonMetadata.image}
        imageAlt={callOption.metadata.data.name}
        url={`option/${callOption.publicKey.toBase58()}`}
        twitterLabels={[
          { label: "Strke Price", value: callOption.strikePrice },
          { label: "Premium", value: callOption.cost },
          { label: "Expiry", value: callOption.expiry },
        ]}
      />
      <CallOptionLayout />
    </>
  );
};

CallOptionPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const queryClient = new QueryClient();
      const connection = new anchor.web3.Connection(
        process.env.BACKEND_RPC_ENDPOINT as string
      );
      const callOptionAddress = new anchor.web3.PublicKey(
        ctx.query.optionId as string
      );

      const callOption = await queryClient.fetchQuery(
        getCallOptionCacheKey(callOptionAddress),
        () => fetchCallOption(connection, callOptionAddress)
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

const CallOptionLayout = () => {
  const anchorWallet = useAnchorWallet();

  const callOptionAddress = usePageParam();
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
            <Detail
              footer={
                <Box mt="4" mb="4">
                  {renderListedButton()}
                </Box>
              }
            >
              <Text>
                {callOption?.expired
                  ? `This call option has now expired.${
                      callOption?.isSeller(anchorWallet)
                        ? " You may close the account to unlock the NFT."
                        : ""
                    }`
                  : `This NFT will remain locked until expiry on ${callOption.expiryLongFormat}, unless exercised.`}
              </Text>
            </Detail>
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
            <Detail
              footer={
                <Box mt="4" mb="4">
                  {renderActiveButton()}
                </Box>
              }
            >
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
            </Detail>
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
            <Detail
              footer={
                <Box mt="4" mb="4">
                  {renderCloseAccountButton()}
                </Box>
              }
            >
              <Text>
                Listing has ended.{" "}
                {callOption.isBuyer(anchorWallet)
                  ? "You exercised the call the option."
                  : "The call option was exercised by the buyer."}
              </Text>
            </Detail>
          </>
        );

      case CallOptionStateEnum.Cancelled:
        return (
          <>
            <Detail>
              <Text>Call option account closed.</Text>
            </Detail>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <NftLayout
      metadata={callOption?.metadata}
      stats={
        callOption
          ? [
              [
                { label: "Cost", value: callOption.cost },
                { label: "Expiry", value: callOption.expiry },
                { label: "Strike Price", value: callOption.strikePrice },
              ],
              [{ label: "Floor Value", value: floorValue }],
            ]
          : undefined
      }
      action={renderByState()}
    />
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
      <Button variant="primary" w="100%" onClick={onLend}>
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
      <Button variant="primary" w="100%" onClick={onCancel}>
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
      <Button variant="primary" w="100%" onClick={onRepay}>
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
