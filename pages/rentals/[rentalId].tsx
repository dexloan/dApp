import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import {
  Button,
  Container,
  Flex,
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
import { DocumentHead } from "../../components/document";
import { useHireQuery } from "../../hooks/query";
import { CallOptionButton, LoanButton } from "../../components/buttons";
import { TakeRentalForm } from "../../components/form";
import { NftLayout } from "../../components/layout";
import { Detail } from "../../components/detail";

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
              <Tag>
                <TagLeftIcon boxSize="12px" as={IoList} />
                <TagLabel>Listed</TagLabel>
              </Tag>
            </Box>
            <Detail
              footer={
                <Box mt="4">
                  {renderListedButton()}
                  <EscrowBalance hire={hire} />
                  <SecondaryButtons hire={hire} />
                </Box>
              }
            >
              <Text>Available for rent until {hire.expiryLongFormat}.</Text>
            </Detail>
          </>
        );

      case HireStateEnum.Hired:
        return (
          <>
            <Box display="flex" pb="4">
              {hire.currentPeriodExpired ? (
                <Tag>
                  <TagLeftIcon boxSize="12px" as={IoList} />
                  <TagLabel>Listed</TagLabel>
                </Tag>
              ) : (
                <Tag>
                  <TagLeftIcon boxSize="12px" as={IoLeaf} />
                  <TagLabel>Rental Active</TagLabel>
                </Tag>
              )}
              {(isBorrower || isLender) && hire.currentPeriodExpired && (
                <Tag ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Expired</TagLabel>
                </Tag>
              )}
            </Box>
            <Detail
              footer={
                <Box mt="4">
                  {renderActiveButton()}
                  <EscrowBalance hire={hire} />
                  <SecondaryButtons hire={hire} />
                </Box>
              }
            >
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
            </Detail>
          </>
        );

      case HireStateEnum.Cancelled:
        return (
          <>
            <Detail>
              <Text>Rental account closed.</Text>
            </Detail>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <NftLayout
      metadata={hire?.metadata}
      stats={
        hire
          ? [
              [
                { label: "Daily Fee", value: hire.amount },
                { label: "Available Until", value: hire.expiry },
              ],
            ]
          : undefined
      }
      action={renderByState()}
    />
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
          variant="primary"
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
      <TakeRentalForm rental={hire} onSubmit={onLend} />
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
      <TakeRentalForm label="Extend Rental" rental={hire} onSubmit={onLend} />
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
      <Button variant="primary" w="100%" onClick={onCancel}>
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
      <Button variant="primary" w="100%" onClick={onRecover}>
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
