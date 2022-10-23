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
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert, IoList } from "react-icons/io5";
import { Controller, useForm } from "react-hook-form";

import {
  CallOptionStateEnum,
  HireStateEnum,
  LoanStateEnum,
} from "../../common/types";
import { fetchHire } from "../../common/query";
import { CallOption, Hire, Loan } from "../../common/model";
import {
  getHireCacheKey,
  getMetadataFileCacheKey,
  useMetadataFileQuery,
  useCallOptionAddressQuery,
  useCallOptionQuery,
  useLoanAddressQuery,
  useLoanQuery,
} from "../../hooks/query";
import {
  useTakeHireMutation,
  useRecoverHireMutation,
  useExtendHireMutation,
  useWithdrawFromHireEscrowMutation,
  useCloseHireMutation,
} from "../../hooks/mutation";
import {
  TakeHireDialog,
  RecoverHireDialog,
  ExtendHireDialog,
  CancelDialog,
} from "../../components/dialog";
import { Activity } from "../../components/activity";
import { DocumentHead } from "../../components/document";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { useHireQuery } from "../../hooks/query";
import { CallOptionButton, LoanButton } from "../../components/buttons";

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
      const connection = new anchor.web3.Connection(
        process.env.BACKEND_RPC_ENDPOINT as string
      );
      const hireAddress = new anchor.web3.PublicKey(
        ctx.query.rentalId as string
      );

      const hire = await queryClient.fetchQuery(
        getHireCacheKey(hireAddress),
        () => fetchHire(connection, hireAddress)
      );

      await queryClient.prefetchQuery(
        getMetadataFileCacheKey(hire.metadata.data.uri),
        () =>
          fetch(hire.metadata.data.uri).then((response) => {
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
    () => new anchor.web3.PublicKey(router.query.rentalId as string),
    [router]
  );
}

interface HireLayoutProps {
  hire: Hire;
}

const HireLayout = ({ hire }: HireLayoutProps) => {
  const anchorWallet = useAnchorWallet();

  const isBorrower = useMemo(
    () => hire.isBorrower(anchorWallet),
    [hire, anchorWallet]
  );
  const isLender = useMemo(
    () => hire.isLender(anchorWallet),
    [hire, anchorWallet]
  );

  function renderActiveButton() {
    if (anchorWallet && hire.isBorrower(anchorWallet)) {
      return <ExtendButton hire={hire} />;
    } else if (anchorWallet && hire.currentPeriodExpired && isLender) {
      return <RecoverButton hire={hire} />;
    } else if (hire.currentPeriodExpired) {
      return <HireButton hire={hire} />;
    }

    return null;
  }

  function renderListedButton() {
    if (anchorWallet && hire.isLender(anchorWallet)) {
      return <CloseButton hire={hire} />;
    } else {
      return <HireButton hire={hire} />;
    }
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
              <Text>Available for rent until {hire.expiryLongFormat}.</Text>
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
              {hire.currentPeriodExpired ? (
                <Tag colorScheme="green">
                  <TagLeftIcon boxSize="12px" as={IoList} />
                  <TagLabel>Listed</TagLabel>
                </Tag>
              ) : (
                <Tag colorScheme="green">
                  <TagLeftIcon boxSize="12px" as={IoLeaf} />
                  <TagLabel>Rental Active</TagLabel>
                </Tag>
              )}
              {(isBorrower || isLender) && hire.currentPeriodExpired && (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Expired</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              {hire.currentPeriodExpired ? (
                isBorrower || isLender ? (
                  <Text>
                    Current rental expired on {hire.currentExpiryLongFormat}.
                  </Text>
                ) : (
                  <Text>Available for rent until {hire.expiryLongFormat}</Text>
                )
              ) : (
                <Text>
                  Currently rented until {hire.currentExpiryLongFormat}
                </Text>
              )}
            </Box>
            <Box mt="4" mb="4">
              {renderActiveButton()}
            </Box>
          </>
        );

      case HireStateEnum.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Rental account closed.</Text>
            </Box>
          </>
        );

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
            Rental
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

          <EscrowBalance hire={hire} />

          <SecondaryButtons hire={hire} />

          <Activity mint={hire?.data.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface EscrowBalanceProps {
  hire: Hire;
}

const EscrowBalance = ({ hire }: EscrowBalanceProps) => {
  const anchorWallet = useAnchorWallet();
  const mutation = useWithdrawFromHireEscrowMutation();

  const amount = useMemo(() => {
    if (
      !hire.data.escrowBalance.isZero() &&
      !hire.calculateWithdrawlAmount().isZero()
    ) {
      return hire.withdrawlAmount;
    }
  }, [hire]);

  if (hire.isLender(anchorWallet) && amount) {
    return (
      <Box flex={1} mb="2">
        <Button
          w="100%"
          colorScheme="green"
          isLoading={mutation.isLoading}
          onClick={() => mutation.mutate(hire.data)}
        >
          Collect {hire.withdrawlAmount} in rental fees
        </Button>
      </Box>
    );
  }

  return null;
};

interface SecondaryButtonProps {
  hire: Hire;
}

const SecondaryButtons = ({ hire }: SecondaryButtonProps) => {
  const anchorWallet = useAnchorWallet();

  const callOptionAddressQuery = useCallOptionAddressQuery(
    hire.data.mint,
    anchorWallet?.publicKey
  );
  const callOptionQuery = useCallOptionQuery(callOptionAddressQuery?.data);

  const loanAddressQuery = useLoanAddressQuery(
    hire.data.mint,
    anchorWallet?.publicKey
  );
  const loanQuery = useLoanQuery(loanAddressQuery?.data);

  const loan = useMemo(() => {
    if (loanQuery.data) {
      return Loan.fromJSON(loanQuery.data);
    }
  }, [loanQuery.data]);

  const callOption = useMemo(() => {
    if (callOptionQuery.data) {
      return CallOption.fromJSON(callOptionQuery.data);
    }
  }, [callOptionQuery.data]);

  if (hire.isLender(anchorWallet)) {
    if (callOption && callOption.state !== CallOptionStateEnum.Cancelled) {
      return (
        <Box mt="2" mb="2" flex={1}>
          <NextLink
            href={`/option/${callOptionAddressQuery?.data?.toBase58()}`}
          >
            <Button w="100%">View Call Option</Button>
          </NextLink>
        </Box>
      );
    }

    if (
      loan &&
      loan.state !== LoanStateEnum.Cancelled &&
      loan.state !== LoanStateEnum.Repaid
    )
      return (
        <Box mt="2" mb="2" flex={1}>
          <NextLink href={`/loan/${loanAddressQuery?.data?.toBase58()}`}>
            <Button w="100%">View Loan</Button>
          </NextLink>
        </Box>
      );

    return (
      <Flex direction="row" gap="2">
        <Box mt="2" mb="2" flex={1}>
          <CallOptionButton mint={hire.data.mint} />
        </Box>
        <Box mt="2" mb="2" flex={1}>
          <LoanButton mint={hire.data.mint} />
        </Box>
      </Flex>
    );
  }

  return null;
};

interface HireButtonProps {
  hire: Hire;
}

const HireButton = ({ hire }: HireButtonProps) => {
  const [dialog, setDialog] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const mutation = useTakeHireMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onLend(data: { days: number }) {
    if (anchorWallet) {
      setDays(data.days);
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <HireForm hire={hire} onSubmit={onLend} />
      <TakeHireDialog
        hire={hire}
        days={days}
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
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
  const [dialog, setDialog] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const mutation = useExtendHireMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onLend(data: { days: number }) {
    if (anchorWallet) {
      setDays(data.days);
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <HireForm label="Extend Rental" hire={hire} onSubmit={onLend} />
      <ExtendHireDialog
        hire={hire}
        days={days ?? 0}
        open={Boolean(dialog)}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
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

const HireForm = ({ label = "Rent", hire, onSubmit }: HireFormProps) => {
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
              max: { value: maxDays, message: "Exceeds maximum rental period" },
              validate: (value) => {
                return !isNaN(value);
              },
            }}
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <FormControl isInvalid={Boolean(error)}>
                <FormLabel htmlFor="cost">Days</FormLabel>
                <Input
                  name="days"
                  placeholder="Enter"
                  value={value}
                  onChange={onChange}
                />
                <FormHelperText>
                  {error?.message?.length
                    ? error.message
                    : "The number of days you wish to rent"}
                </FormHelperText>
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
  const mutation = useCloseHireMutation(() => setDialog(false));
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
      <CancelDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(hire.data)}
      />
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

  async function onRecover() {
    if (anchorWallet) {
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <Button colorScheme="blue" w="100%" onClick={onRecover}>
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
