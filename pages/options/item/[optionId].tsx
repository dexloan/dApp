import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Button,
  Container,
  Heading,
  Flex,
  Box,
  Tag,
  TagLeftIcon,
  TagLabel,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { CallOptionState } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert, IoList, IoCheckmark } from "react-icons/io5";

import {
  fetchCallOption,
  useCallOptionQuery,
  useMetadataFileQuery,
} from "../../../hooks/query";
import {
  useAmount,
  useFloorPrice,
  useStrikePrice,
  useExpiry,
  useIsExpired,
} from "../../../hooks/render";
import {
  useBuyCallOptionMutation,
  useCloseCallOptionMutation,
  useExerciseCallOptionMutation,
} from "../../../hooks/mutation";
import {
  BuyCallOptionDialog,
  ExerciseDialog,
  CloseCallOptionDialog,
} from "../../../components/dialog";
import { Detail } from "../../../components/detail";
import { NftLayout } from "../../../components/layout";
import { DocumentHead } from "../../../components/document";
import { CallOptionJson } from "../../../common/types";

interface CallOptionProps {
  dehydratedState: DehydratedState | undefined;
}

const CallOptionPage: NextPage<CallOptionProps> = () => {
  const callOptionPda = usePageParam();
  const callOptionQueryResult = useCallOptionQuery(callOptionPda);
  const metadataQuery = useMetadataFileQuery(callOptionQueryResult.data?.uri);
  const callOption = callOptionQueryResult.data;
  const jsonMetadata = metadataQuery.data;

  const amount = useAmount(callOption);
  const strikePrice = useStrikePrice(callOption);
  const expiry = useExpiry(callOption);

  if (callOptionQueryResult.isLoading || metadataQuery.isLoading) {
    return (
      <Box
        display="flex"
        w="100%"
        paddingTop="20%"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="sm" />
      </Box>
    );
  }

  if (callOptionQueryResult.error || !callOption || !jsonMetadata) {
    return (
      <Container maxW="container.md">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">
              {callOptionQueryResult.error instanceof Error
                ? callOptionQueryResult.error.message
                : `Option with address ${callOptionPda} not found`}
            </Text>
          </Flex>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <DocumentHead
        title={jsonMetadata.name}
        description={`Call Option with strike price ${callOption.strikePrice} expiring ${callOption.expiry}`}
        image={jsonMetadata.image}
        imageAlt={jsonMetadata.name}
        url={`option/${callOptionPda}`}
        twitterLabels={[
          {
            label: "Strke Price",
            value: strikePrice,
          },
          { label: "Premium", value: amount },
          { label: "Expiry", value: expiry },
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
      const callOptionPda = new anchor.web3.PublicKey(
        ctx.query.optionId as string
      );

      const callOption = await queryClient.fetchQuery(
        ["call_option", callOptionPda.toBase58()],
        () => fetchCallOption(callOptionPda.toBase58())
      );
      console.log(callOption);
      await queryClient.prefetchQuery(["metadata_file", callOption.uri], () =>
        fetch(callOption.uri).then((res) => res.json())
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
  return router.query.optionId as string | undefined;
}

const CallOptionLayout = () => {
  const anchorWallet = useAnchorWallet();

  const callOptionPda = usePageParam();
  const callOptionQuery = useCallOptionQuery(callOptionPda);
  const metadataQuery = useMetadataFileQuery(callOptionQuery.data?.uri);
  const callOption = callOptionQuery.data;
  const jsonMetadata = metadataQuery.data;

  const isBuyer =
    anchorWallet && anchorWallet.publicKey.toBase58() === callOption?.buyer;
  const isSeller =
    anchorWallet && anchorWallet.publicKey.toBase58() === callOption?.seller;
  const amount = useAmount(callOption);
  const strikePrice = useStrikePrice(callOption);
  const expiry = useExpiry(callOption);
  const expiryLongFormat = useExpiry(callOption, true);
  const isExpired = useIsExpired(callOption);
  const floorPrice = useFloorPrice(callOption);

  function renderListedButton() {
    if (callOption && isSeller) {
      return <CloseButton callOption={callOption} />;
    } else if (callOption && !isExpired) {
      return <BuyButton callOption={callOption} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (callOption && isSeller) {
      // TODO is this needed?
      return <CloseButton callOption={callOption} />;
    }

    return null;
  }

  function renderActiveButton() {
    if (!callOption) return null;

    if (!isExpired && isBuyer) {
      return <ExerciseButton callOption={callOption} />;
    }

    if (isExpired) {
      return renderCloseAccountButton();
    }

    return null;
  }

  function renderByState() {
    if (callOption === undefined) return null;

    switch (callOption.state) {
      case CallOptionState.Listed:
        return (
          <>
            <Box display="flex" pb="4">
              {isExpired ? (
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
                {isExpired
                  ? `This call option has now expired.${
                      isSeller
                        ? " You may close the account to unlock the NFT."
                        : ""
                    }`
                  : `This NFT will remain locked until expiry on ${expiryLongFormat}, unless exercised.`}
              </Text>
            </Detail>
          </>
        );

      case CallOptionState.Active:
        return (
          <>
            <Box display="flex" pb="4">
              {isExpired ? (
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
                {isExpired
                  ? `This call option has now expired.${
                      isSeller
                        ? " You may close the account to unlock the NFT."
                        : ""
                    }`
                  : isBuyer
                  ? `You may excersie this call option until expiry on ${expiryLongFormat}.`
                  : `This NFT will remain locked until expiry on ${expiryLongFormat}, unless exercised.`}
              </Text>
            </Detail>
          </>
        );

      case CallOptionState.Exercised:
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
                {isBuyer
                  ? "You exercised the call the option."
                  : "The call option was exercised by the buyer."}
              </Text>
            </Detail>
          </>
        );

      case CallOptionState.Cancelled:
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
      metadataJson={jsonMetadata}
      stats={
        callOption
          ? [
              [
                { label: "Cost", value: amount },
                { label: "Expiry", value: expiry },
                { label: "Strike Price", value: strikePrice },
              ],
              [{ label: "Floor Value", value: floorPrice }],
            ]
          : undefined
      }
      action={renderByState()}
    />
  );
};

interface BuyButtonProps {
  callOption: CallOptionJson;
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
        onConfirm={() =>
          mutation.mutate({
            mint: new anchor.web3.PublicKey(callOption.mint),
            seller: new anchor.web3.PublicKey(callOption.seller),
          })
        }
      />
    </>
  );
};

interface CloseButtonProps {
  callOption: CallOptionJson;
}

const CloseButton = ({ callOption }: CloseButtonProps) => {
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  const [dialog, setDialog] = useState(false);
  const isExpired = useIsExpired(callOption);

  const mutation = useCloseCallOptionMutation(() => setDialog(false));

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
        {isExpired ? "Close Account" : "Close Option"}
      </Button>
      <CloseCallOptionDialog
        open={dialog}
        loading={mutation.isLoading}
        callOption={callOption}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            mint: new anchor.web3.PublicKey(callOption.mint),
            seller: new anchor.web3.PublicKey(callOption.seller),
          })
        }
      />
    </>
  );
};

interface ExerciseButtonProps {
  callOption: CallOptionJson;
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
          mutation.mutate({
            mint: new anchor.web3.PublicKey(callOption.mint),
            seller: new anchor.web3.PublicKey(callOption.seller),
          })
        }
      />
    </>
  );
};

export default CallOptionPage;
