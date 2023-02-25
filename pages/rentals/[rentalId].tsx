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
import { RentalState, LoanState, CallOptionState } from "@prisma/client";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert, IoList } from "react-icons/io5";

import { fetchRental } from "../../common/query";
import { Rental } from "../../common/model";
import {
  getRentalCacheKey,
  getMetadataFileCacheKey,
  useMetadataFileQuery,
  useCallOptionAddress,
  useCallOptionQuery,
  useLoanAddress,
  useLoanQuery,
} from "../../hooks/query";
import {
  useTakeRentalMutation,
  useRecoverRentalMutation,
  useExtendRentalMutation,
  useWithdrawFromRentalEscrowMutation,
  useCloseRentalMutation,
} from "../../hooks/mutation";
import {
  TakeRentalDialog,
  RecoverRentalDialog,
  ExtendRentalDialog,
  CancelDialog,
} from "../../components/dialog";
import { DocumentHead } from "../../components/document";
import { useRentalQuery } from "../../hooks/query";
import { CallOptionButton, LoanButton } from "../../components/buttons";
import { TakeRentalForm } from "../../components/form";
import { NftLayout } from "../../components/layout";
import { Detail } from "../../components/detail";

interface RentalProps {
  dehydratedState: DehydratedState | undefined;
}

const RentalPage: NextPage<RentalProps> = () => {
  const hireAddress = usePageParam();
  const hireQueryResult = useRentalQuery(hireAddress);
  const metadataQuery = useMetadataFileQuery(
    hireQueryResult.data?.metadata.data.uri
  );
  const jsonMetadata = metadataQuery.data;

  const rental = useMemo(() => {
    if (hireQueryResult.data) {
      return Rental.fromJSON(hireQueryResult.data);
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

  if (!rental || !jsonMetadata) {
    return null;
  }

  return (
    <>
      <DocumentHead
        title={rental.metadata.data.name}
        description={`Rental for ${rental.amount} per day`}
        image={jsonMetadata.image}
        imageAlt={rental.metadata.data.name}
        url={`rental/${rental.publicKey.toBase58()}`}
        twitterLabels={[
          { label: "Daily fee", value: rental.amount },
          { label: "Available Until", value: rental.expiry },
        ]}
      />
      <RentalLayout rental={rental} />
    </>
  );
};

RentalPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const queryClient = new QueryClient();
      const connection = new anchor.web3.Connection(
        process.env.BACKEND_RPC_ENDPOINT as string
      );
      const hireAddress = new anchor.web3.PublicKey(
        ctx.query.rentalId as string
      );

      const rental = await queryClient.fetchQuery(
        getRentalCacheKey(hireAddress),
        () => fetchRental(connection, hireAddress)
      );

      await queryClient.prefetchQuery(
        getMetadataFileCacheKey(rental.metadata.data.uri),
        () =>
          fetch(rental.metadata.data.uri).then((response) => {
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

interface RentalLayoutProps {
  rental: Rental;
}

const RentalLayout = ({ rental }: RentalLayoutProps) => {
  const anchorWallet = useAnchorWallet();

  const isBorrower = useMemo(
    () => rental.isBorrower(anchorWallet),
    [rental, anchorWallet]
  );
  const isLender = useMemo(
    () => rental.isLender(anchorWallet),
    [rental, anchorWallet]
  );

  function renderActiveButton() {
    if (anchorWallet && rental.isBorrower(anchorWallet)) {
      return <ExtendButton rental={rental} />;
    } else if (anchorWallet && rental.currentPeriodExpired && isLender) {
      return <RecoverButton rental={rental} />;
    } else if (rental.currentPeriodExpired) {
      return <RentalButton rental={rental} />;
    }

    return null;
  }

  function renderListedButton() {
    if (anchorWallet && rental.isLender(anchorWallet)) {
      return <CloseButton rental={rental} />;
    } else {
      return <RentalButton rental={rental} />;
    }
  }

  function renderByState() {
    if (rental === undefined) return null;

    switch (rental.state) {
      case RentalState.Listed:
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
                  <EscrowBalance rental={rental} />
                  <SecondaryButtons rental={rental} />
                </Box>
              }
            >
              <Text>Available for rent until {rental.expiryLongFormat}.</Text>
            </Detail>
          </>
        );

      case RentalState.Rented:
        return (
          <>
            <Box display="flex" pb="4">
              {rental.currentPeriodExpired ? (
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
              {(isBorrower || isLender) && rental.currentPeriodExpired && (
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
                  <EscrowBalance rental={rental} />
                  <SecondaryButtons rental={rental} />
                </Box>
              }
            >
              {rental.currentPeriodExpired ? (
                isBorrower || isLender ? (
                  <Text>
                    Current rental expired on {rental.currentExpiryLongFormat}.
                  </Text>
                ) : (
                  <Text>
                    Available for rent until {rental.expiryLongFormat}
                  </Text>
                )
              ) : (
                <Text>
                  Currently rented until {rental.currentExpiryLongFormat}
                </Text>
              )}
            </Detail>
          </>
        );

      case RentalState.Cancelled:
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
    // <NftLayout
    //   metadata={rental?.metadata}
    //   stats={
    //     rental
    //       ? [
    //           [
    //             { label: "Daily Fee", value: rental.amount },
    //             { label: "Available Until", value: rental.expiry },
    //           ],
    //         ]
    //       : undefined
    //   }
    //   action={renderByState()}
    // />
    null
  );
};

interface EscrowBalanceProps {
  rental: Rental;
}

const EscrowBalance = ({ rental }: EscrowBalanceProps) => {
  const anchorWallet = useAnchorWallet();
  const mutation = useWithdrawFromRentalEscrowMutation();

  const amount = useMemo(() => {
    if (
      !rental.data.escrowBalance.isZero() &&
      !rental.calculateWithdrawlAmount().isZero()
    ) {
      return rental.withdrawlAmount;
    }
  }, [rental]);

  if (rental.isLender(anchorWallet) && amount) {
    return (
      <Box flex={1} mb="2">
        <Button
          w="100%"
          variant="primary"
          isLoading={mutation.isLoading}
          onClick={() => mutation.mutate(rental.data)}
        >
          Collect {rental.withdrawlAmount} in rental fees
        </Button>
      </Box>
    );
  }

  return null;
};

interface SecondaryButtonProps {
  rental: Rental;
}

const SecondaryButtons = ({ rental }: SecondaryButtonProps) => {
  const anchorWallet = useAnchorWallet();

  const callOptionAddress = useCallOptionAddress(
    rental.data.mint,
    anchorWallet?.publicKey
  );
  // const callOptionQuery = useCallOptionQuery(callOptionAddress);

  const loanAddress = useLoanAddress(rental.data.mint, anchorWallet?.publicKey);
  // const loanQuery = useLoanQuery(loanAddress);

  // const loan = useMemo(() => {
  //   if (loanQuery.data) {
  //     return Loan.fromJSON(loanQuery.data);
  //   }
  // }, [loanQuery.data]);

  // const callOption = useMemo(() => {
  //   if (callOptionQuery.data) {
  //     return CallOption.fromJSON(callOptionQuery.data);
  //   }
  // }, [callOptionQuery.data]);

  if (rental.isLender(anchorWallet)) {
    // if (callOption && callOption.state !== CallOptionState.Cancelled) {
    //   return (
    //     <Box mt="2" mb="2" flex={1}>
    //       <NextLink href={`/option/${callOptionAddress?.toBase58()}`}>
    //         <Button w="100%">View Call Option</Button>
    //       </NextLink>
    //     </Box>
    //   );
    // }

    // if (
    //   loan &&
    //   loan.state !== LoanState.Cancelled &&
    //   loan.state !== LoanState.Repaid
    // )
    //   return (
    //     <Box mt="2" mb="2" flex={1}>
    //       <NextLink href={`/loan/${loanAddress?.toBase58()}`}>
    //         <Button w="100%">View Loan</Button>
    //       </NextLink>
    //     </Box>
    //   );

    return (
      <Flex direction="row" gap="2">
        <Box mt="2" mb="2" flex={1}>
          <CallOptionButton mint={rental.data.mint} />
        </Box>
        <Box mt="2" mb="2" flex={1}>
          <LoanButton mint={rental.data.mint} />
        </Box>
      </Flex>
    );
  }

  return null;
};

interface RentalButtonProps {
  rental: Rental;
}

const RentalButton = ({ rental }: RentalButtonProps) => {
  const [dialog, setDialog] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const mutation = useTakeRentalMutation(() => setDialog(false));
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
      <TakeRentalForm rental={rental} onSubmit={onLend} />
      <TakeRentalDialog
        rental={rental}
        days={days}
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => {
          if (days) {
            mutation.mutate({
              ...rental.data,
              metadata: rental.metadata,
              days,
            });
          }
        }}
      />
    </>
  );
};

interface ExtendButtonProps {
  rental: Rental;
}

const ExtendButton = ({ rental }: ExtendButtonProps) => {
  const [dialog, setDialog] = useState<boolean>(false);
  const [days, setDays] = useState<number>(1);
  const mutation = useExtendRentalMutation(() => setDialog(false));
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
      <TakeRentalForm label="Extend Rental" rental={rental} onSubmit={onLend} />
      <ExtendRentalDialog
        rental={rental}
        days={days ?? 0}
        open={Boolean(dialog)}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => {
          if (days) {
            mutation.mutate({
              ...rental.data,
              metadata: rental.metadata,
              days,
            });
          }
        }}
      />
    </>
  );
};

interface CloseButtonProps {
  rental: Rental;
}

const CloseButton = ({ rental }: CloseButtonProps) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseRentalMutation(() => setDialog(false));
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
        onConfirm={() => mutation.mutate(rental.data)}
      />
    </>
  );
};

interface RecoverButtonProps {
  rental: Rental;
}

const RecoverButton = ({ rental }: RecoverButtonProps) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useRecoverRentalMutation(() => setDialog(false));
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
      <RecoverRentalDialog
        open={dialog}
        loading={mutation.isLoading}
        rental={rental}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => {
          const data = rental.data;
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

export default RentalPage;
