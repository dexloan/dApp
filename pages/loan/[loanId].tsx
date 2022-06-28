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
import { LoanState, RPC_ENDPOINT } from "../../common/constants";
import { ListingState } from "../../common/types";
import { fetchLoan } from "../../common/query";
import {
  useFloorPriceQuery,
  useListingQuery,
  useLoanQuery,
  useLoansQuery,
} from "../../hooks/query";
import {
  useCloseListingMutation,
  useInitLoanMutation,
  useCloseLoanMutation,
  useGiveLoanMutation,
  useRepayLoanMutation,
  useRepossessMutation,
} from "../../hooks/mutation";
import {
  CancelDialog,
  CloseAccountDialog,
  LoanDialog,
  RepayDialog,
  RepossessDialog,
} from "../../components/dialog";
import { Activity } from "../../components/activity";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { EllipsisProgress } from "../../components/progress";

interface LoanProps {
  initialData: {
    loan: {
      publicKey: any;
      data: any;
      metadata: any;
    };
    jsonMetadata: any;
  } | null;
}

const LoanPage: NextPage<LoanProps> = (props) => {
  return (
    <>
      <ListingHead {...props} />
      <LoanLayout />
    </>
  );
};

LoanPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const pubkey = new anchor.web3.PublicKey(ctx.query.listingId as string);
      const result = await fetchLoan(connection, pubkey);
      const jsonMetadata = await fetch(result.metadata.data.uri).then(
        (response) => {
          return response.json().then((data) => data);
        }
      );

      return {
        initialData: {
          loan: {
            publicKey: result.publicKey.toBase58(),
            data: {
              ...result.data,
              amount: result.data.amount.toNumber(),
              borrower: result.data.borrower.toBase58(),
              lender: result.data.lender.toBase58(),
              duration: result.data.duration.toNumber(),
              startDate: result.data.startDate.toNumber(),
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

const ListingHead = ({ initialData }: LoanProps) => {
  if (initialData) {
    const description = `Borrowring ${utils.formatAmount(
      new anchor.BN(initialData.loan.data.amount)
    )} over ${utils.formatDuration(
      new anchor.BN(initialData.loan.data.duration)
    )}`;

    return (
      <Head>
        <title>{initialData.loan.metadata.data.name}</title>
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
          content={`https://dexloan.io/loan/${initialData.loan.publicKey}`}
        />
        <meta property="og:image" content={initialData.jsonMetadata.image} />

        <meta
          property="twitter:title"
          content={initialData.jsonMetadata.name}
        />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={`https://dexloan.io/loan/${initialData.loan.publicKey}`}
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
            new anchor.BN(initialData.loan.data.amount)
          )}
        />
        <meta property="twitter:label2" content="APY" />
        <meta
          property="twitter:data2"
          content={initialData.loan.data.basisPoints / 100 + "%"}
        />
        <meta property="twitter:label3" content="Duration" />
        <meta
          property="twitter:data3"
          content={utils.formatDuration(
            new anchor.BN(initialData.loan.data.duration)
          )}
        />
      </Head>
    );
  }

  return null;
};

const LoanLayout = () => {
  const router = useRouter();
  const { loanId } = router.query;
  const anchorWallet = useAnchorWallet();

  const pubkey = loanId
    ? new anchor.web3.PublicKey(loanId as string)
    : undefined;
  const listingQuery = useLoanQuery(pubkey);

  const symbol = listingQuery.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const loan = listingQuery.data?.data;
  const metadata = listingQuery.data?.metadata;

  const hasExpired =
    loan?.startDate && utils.hasExpired(loan.startDate, loan.duration);

  const isLender =
    loan && loan.lender.toBase58() === anchorWallet?.publicKey.toBase58();
  const isBorrower =
    loan && loan.borrower.toBase58() === anchorWallet?.publicKey.toBase58();

  function renderActiveButton() {
    if (loan && pubkey && isBorrower) {
      return (
        <RepayButton
          amount={loan.amount}
          basisPoints={loan.basisPoints}
          duration={loan.duration}
          startDate={loan.startDate}
          mint={loan.mint}
          lender={loan.lender}
        />
      );
    } else if (hasExpired && loan && isLender) {
      return <RepossessButton mint={loan.mint} borrower={loan.borrower} />;
    }

    return null;
  }

  function renderListedButton() {
    if (loan && isBorrower) {
      return <CancelButton mint={loan.mint} />;
    } else if (loan && pubkey) {
      return (
        <LendButton
          amount={loan.amount}
          borrower={loan.borrower}
          duration={loan.duration}
          basisPoints={loan.basisPoints}
          mint={loan.mint}
        />
      );
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (
      loan &&
      loan.borrower.toBase58() === anchorWallet?.publicKey.toBase58()
    ) {
      return <CloseAccountButton mint={loan.mint} />;
    }

    return null;
  }

  function renderLTV() {
    if (loan?.amount && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (loan.amount.toNumber() / floorPriceQuery.data.floorPrice) * 100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }

  function renderByState() {
    if (loan === undefined) return null;

    switch (loan.state) {
      case LoanState.Listed:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Total amount due on{" "}
                {utils.formatDueDate(
                  new anchor.BN(Date.now() / 1000),
                  loan.duration,
                  false
                )}{" "}
                will be&nbsp;
                <Text as="span" fontWeight="semibold">
                  {utils.formatAmountOnMaturity(
                    loan.amount,
                    loan.duration,
                    loan.basisPoints
                  )}
                </Text>
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderListedButton()}
            </Box>
          </>
        );

      case ListingState.Active:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag colorScheme="green">
                <TagLeftIcon boxSize="12px" as={IoLeaf} />
                <TagLabel>Loan Active</TagLabel>
              </Tag>
              {hasExpired && (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Repayment Overdue</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Repayment {hasExpired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {utils.formatDueDate(loan.startDate, loan.duration)}
                </Text>
                . Failure to repay the loan by this date may result in
                repossession of the NFT by the lender.
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderActiveButton()}
            </Box>
          </>
        );

      case ListingState.Repaid:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Loan has ended. The loan was repaid.</Text>
            </Box>
          </>
        );

      case ListingState.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Loan cancelled.</Text>
            </Box>
          </>
        );

      case ListingState.Defaulted:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
              <Text>
                Loan has ended. The NFT was repossessed by the lender.
              </Text>
            </Box>
            <Box marginY="size-200">{renderCloseAccountButton()}</Box>
          </>
        );

      default:
        return null;
    }
  }

  if (listingQuery.isLoading) {
    // TODO skeleton
    return null;
  }

  if (listingQuery.error instanceof Error) {
    return (
      <Container maxW="container.lg">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">{listingQuery.error.message}</Text>
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
          <ExternalLinks mint={listingQuery.data?.data.mint} />
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

          {loan && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Borrowing
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {utils.formatAmount(loan.amount)}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Duration
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {utils.formatDuration(loan.duration)}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    APY
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {loan.basisPoints / 100}%
                  </Heading>
                </Box>
              </Flex>
              <Flex direction="row" gap="12" mb="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Loan to Floor Value
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {renderLTV()}
                  </Heading>
                </Box>
              </Flex>
            </>
          )}

          {renderByState()}

          <Activity mint={listingQuery.data?.data.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface LoanButtonProps {
  amount: anchor.BN;
  basisPoints: number;
  duration: anchor.BN;
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

const LendButton = ({
  amount,
  basisPoints,
  duration,
  mint,
  borrower,
}: LoanButtonProps) => {
  const [open, setDialog] = useState(false);
  const mutation = useGiveLoanMutation(() => setDialog(false));
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
          })
        }
      />
    </>
  );
};

interface CancelButtonProps {
  mint: anchor.web3.PublicKey;
}

const CancelButton = ({ mint }: CancelButtonProps) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseLoanMutation(() => setDialog(false));
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
        Cancel Listing
      </Button>
      <CancelDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate({ mint })}
      />
    </>
  );
};

interface RepayButtonProps extends Omit<LoanButtonProps, "borrower"> {
  startDate: anchor.BN;
  lender: anchor.web3.PublicKey;
}

const RepayButton = ({
  amount,
  basisPoints,
  duration,
  startDate,
  mint,
  lender,
}: RepayButtonProps) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useRepayLoanMutation(() => setDialog(false));
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
        Repay Loan
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

interface RepossessButtonProps {
  mint: anchor.web3.PublicKey;
  borrower: anchor.web3.PublicKey;
}

const RepossessButton: React.FC<RepossessButtonProps> = ({
  mint,
  borrower,
}) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useRepossessMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onRepossess() {
    if (anchorWallet) {
      setDialog(true);
    } else {
      setVisible(true);
    }
  }

  return (
    <>
      <Button colorScheme="red" w="100%" onClick={onRepossess}>
        Repossess NFT
      </Button>
      <RepossessDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            mint,
            borrower,
          })
        }
      />
    </>
  );
};

interface CloseAcccountButtonProps {
  mint: anchor.web3.PublicKey;
}

export const CloseAccountButton: React.FC<CloseAcccountButtonProps> = ({
  mint,
}) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseListingMutation(() => setDialog(false));
  const anchorWallet = useAnchorWallet();
  const { setVisible } = useWalletModal();

  async function onClose() {
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
      <Button w="100%" onClick={onClose}>
        Close loan account
      </Button>
      <CloseAccountDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            mint,
          })
        }
      />
    </>
  );
};

export default LoanPage;
