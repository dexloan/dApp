import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Badge,
  Button,
  Container,
  Flex,
  FormLabel,
  FormControl,
  FormHelperText,
  Input,
  Heading,
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
import { IoLeaf, IoAlert, IoList } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";

import { RPC_ENDPOINT } from "../../common/constants";
import { HireStateEnum } from "../../common/types";
import { fetchLoan } from "../../common/query";
import { Hire } from "../../common/model";
import {
  getLoanQueryKey,
  getMetadataFileCacheKey,
  useFloorPriceQuery,
  useMetadataFileQuery,
} from "../../hooks/query";
import {
  useTakeHireMutation,
  useRecoverHireMutation,
  useExtendHireMutation,
} from "../../hooks/mutation";
import {
  TakeHireDialog,
  RecoverHireDialog,
  ExtendHireDialog,
} from "../../components/dialog";
import { Activity } from "../../components/activity";
import { DocumentHead } from "../../components/document";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { EllipsisProgress } from "../../components/progress";
import { useHireQuery } from "../../hooks/query";

interface HireProps {
  dehydratedState: DehydratedState | undefined;
}

const HirePage: NextPage<HireProps> = () => {
  const hireAddress = usePageParam();
  const hireQueryResult = useHireQuery(hireAddress);
  const metadataQuery = useMetadataFileQuery(
    hireQueryResult.data?.metadata.data.uri
  );
  const jsonMetadata = metadataQuery.data;

  const hire = useMemo(() => {
    if (hireQueryResult.data) {
      return Hire.fromJSON(hireQueryResult.data);
    }
  }, [hireQueryResult.data]);

  if (hireQueryResult.error instanceof Error) {
    return (
      <Container maxW="container.lg">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">{hireQueryResult.error.message}</Text>
          </Flex>
        </Box>
      </Container>
    );
  }

  if (!hire || !jsonMetadata) {
    return null;
  }

  return (
    <>
      <DocumentHead
        title={hire.metadata.data.name}
        description={`Hire for ${hire.amount} per day`}
        image={jsonMetadata.image}
        imageAlt={hire.metadata.data.name}
        url={`hire/${hire.publicKey.toBase58()}`}
        twitterLabels={[
          { label: "Daily fee", value: hire.amount },
          { label: "Available Until", value: hire.expiry },
        ]}
      />
      <HireLayout hire={hire} />
    </>
  );
};

HirePage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const queryClient = new QueryClient();

      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const loanAddress = new anchor.web3.PublicKey(ctx.query.loanId as string);

      const loan = await queryClient.fetchQuery(
        getLoanQueryKey(loanAddress),
        () => fetchLoan(connection, loanAddress)
      );

      await queryClient.prefetchQuery(
        getMetadataFileCacheKey(loan.metadata.data.uri),
        () =>
          fetch(loan.metadata.data.uri).then((response) => {
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
    () => new anchor.web3.PublicKey(router.query.loanId as string),
    [router]
  );
}

interface HireLayoutProps {
  hire: Hire;
}

const HireLayout = ({ hire }: HireLayoutProps) => {
  const anchorWallet = useAnchorWallet();

  const symbol = hire.metadata?.data?.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  function renderActiveButton() {
    if (hire && anchorWallet && hire.isBorrower(anchorWallet)) {
      return <ExtendButton hire={hire} />;
    } else if (
      hire &&
      hire.expired &&
      anchorWallet &&
      hire.isLender(anchorWallet)
    ) {
      return <RecoverButton hire={hire} />;
    }

    return null;
  }

  function renderListedButton() {
    if (hire && anchorWallet && hire.isLender(anchorWallet)) {
      return <CloseButton hire={hire} />;
    } else if (hire) {
      return <HireButton hire={hire} />;
    }
    return null;
  }

  function renderByState() {
    if (hire === undefined) return null;

    switch (hire.state) {
      case HireStateEnum.Listed:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag colorScheme="green">
                <TagLeftIcon boxSize="12px" as={IoList} />
                <TagLabel>Listed</TagLabel>
              </Tag>
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Available for hire until {hire.expiry}.</Text>
            </Box>
            <Box mt="4" mb="4">
              {renderListedButton()}
            </Box>
          </>
        );

      case HireStateEnum.Hired:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag colorScheme="green">
                <TagLeftIcon boxSize="12px" as={IoLeaf} />
                <TagLabel>Loan Active</TagLabel>
              </Tag>
              {hire.isLender(anchorWallet) && hire.expired && (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Expired</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Currently hired until {hire.currentExpiry}</Text>
            </Box>
            <Box mt="4" mb="4">
              {renderActiveButton()}
            </Box>
          </>
        );

      // case HireStateEnum.Cancelled:
      //   return (
      //     <>
      //       <Box p="4" borderRadius="lg" bgColor="blue.50">
      //         <Text>Hire account closed.</Text>
      //       </Box>
      //     </>
      //   );

      default:
        return null;
    }
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
          <ListingImage uri={hire?.metadata.data.uri} />
          <ExternalLinks mint={hire?.data.mint} />
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Hire
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {hire?.metadata.data.name}
          </Heading>
          <Box mb="8">
            <VerifiedCollection symbol={hire?.metadata.data.symbol} />
          </Box>

          {hire && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Daily Fee
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {hire.amount}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Available Until
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {hire.expiry}
                  </Heading>
                </Box>
              </Flex>
            </>
          )}

          {renderByState()}

          <Activity mint={hire?.data.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface HireButtonProps {
  hire: Hire;
}

const HireButton = ({ hire }: HireButtonProps) => {
  const [days, setDialog] = useState<number | null>(null);
  const mutation = useTakeHireMutation(() => setDialog(null));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onLend(data: { days: number }) {
    if (anchorWallet) {
      setDialog(data.days);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <HireForm hire={hire} onSubmit={onLend} />
      <TakeHireDialog
        hire={hire}
        days={days ?? 0}
        open={Boolean(open)}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(null)}
        onConfirm={() => {
          if (days) {
            mutation.mutate({
              ...hire.data,
              metadata: hire.metadata,
              days,
            });
          }
        }}
      />
    </>
  );
};

interface ExtendButtonProps {
  hire: Hire;
}

const ExtendButton = ({ hire }: ExtendButtonProps) => {
  const [days, setDialog] = useState<number | null>(null);
  const mutation = useExtendHireMutation(() => setDialog(null));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onLend(data: { days: number }) {
    if (anchorWallet) {
      setDialog(data.days);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <HireForm hire={hire} onSubmit={onLend} />
      <ExtendHireDialog
        hire={hire}
        days={days ?? 0}
        open={Boolean(open)}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(null)}
        onConfirm={() => {
          if (days) {
            mutation.mutate({
              ...hire.data,
              metadata: hire.metadata,
              days,
            });
          }
        }}
      />
    </>
  );
};

interface HireFormProps {
  label?: string;
  hire: Hire;
  onSubmit: (data: { days: number }) => void;
}

const HireForm = ({ label = "Hire", hire, onSubmit }: HireFormProps) => {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<{ days: number }>({
    mode: "onChange",
    defaultValues: {
      days: 1,
    },
  });

  const maxDays = useMemo(() => hire.maxDays, [hire]);

  return (
    <>
      <FormControl isInvalid={!isValid}>
        <Box pb="6">
          <Controller
            name="days"
            control={control}
            rules={{
              required: true,
              min: 1,
              max: maxDays,
              validate: (value) => {
                return !isNaN(value);
              },
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormLabel htmlFor="cost">Cost</FormLabel>
                <Input
                  name="days"
                  placeholder="0.00◎"
                  value={value}
                  onChange={onChange}
                />
                <FormHelperText>The cost of the call option</FormHelperText>
              </FormControl>
            )}
          />
        </Box>
      </FormControl>
      <Button colorScheme="green" w="100%" onClick={handleSubmit(onSubmit)}>
        {label}
      </Button>
    </>
  );
};

interface CloseButtonProps {
  hire: Hire;
}

const CloseButton = ({ hire }: CloseButtonProps) => {
  const [dialog, setDialog] = useState(false);
  // const mutation = useCloseHireMutation(() => setDialog(false));
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
        Close Listing
      </Button>
      {/* <CancelDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(hire.data)}
      /> */}
    </>
  );
};

interface RecoverButtonProps {
  hire: Hire;
}

const RecoverButton = ({ hire }: RecoverButtonProps) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useRecoverHireMutation(() => setDialog(false));
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
        Recover NFT
      </Button>
      <RecoverHireDialog
        open={dialog}
        loading={mutation.isLoading}
        hire={hire}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => {
          const data = hire.data;
          if (data.borrower) {
            mutation.mutate({
              mint: data.mint,
              borrower: data.borrower,
            });
          }
        }}
      />
    </>
  );
};

export default HirePage;
