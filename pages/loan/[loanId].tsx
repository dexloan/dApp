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
import { IoLeaf, IoAlert } from "react-icons/io5";

import { LoanState, RPC_ENDPOINT } from "../../common/constants";
import { ListingState } from "../../common/types";
import { fetchLoan } from "../../common/query";
import { Loan } from "../../common/model";
import {
  getLoanQueryKey,
  getMetadataFileQueryKey,
  useFloorPriceQuery,
  useLoanQuery,
  useMetadataFileQuery,
} from "../../hooks/query";
import {
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
  dehydratedState: DehydratedState | undefined;
}

const LoanPage: NextPage<LoanProps> = () => {
  return (
    <>
      <LoanHead />
      <LoanLayout />
    </>
  );
};

LoanPage.getInitialProps = async (ctx) => {
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
        getMetadataFileQueryKey(loan.metadata.data.uri),
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

const LoanHead = () => {
  const loanAddress = usePageParam();
  const loanQueryResult = useLoanQuery(loanAddress);
  const metadataQuery = useMetadataFileQuery(
    loanQueryResult.data?.metadata.data.uri
  );

  const loan = useMemo(() => {
    if (loanQueryResult.data) {
      return Loan.fromJSON(loanQueryResult.data);
    }
  }, [loanQueryResult.data]);

  const jsonMetadata = metadataQuery.data;

  if (!loan || !jsonMetadata) {
    return null;
  }

  const description = `Borrowring ${loan.amount} over ${loan.duration}`;

  return (
    <Head>
      <title>{loan.metadata.data.name}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Dexloan" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"></link>
      <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />

      <meta property="og:title" content={loan.metadata.data.name} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      <meta
        property="og:url"
        content={`https://dexloan.io/loan/${loan.publicKey.toBase58()}`}
      />
      <meta property="og:image" content={jsonMetadata.image} />

      <meta property="twitter:title" content={loan.metadata.data.name} />
      <meta property="twitter:description" content={description} />
      <meta
        property="twitter:url"
        content={`https://dexloan.io/loan/${loan.publicKey.toBase58()}`}
      />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content={jsonMetadata.image} />
      <meta property="twitter:image:alt" content={jsonMetadata.name} />
      <meta property="twitter:label1" content="Amount" />
      <meta property="twitter:data1" content={loan.amount} />
      <meta property="twitter:label2" content="APY" />
      <meta
        property="twitter:data2"
        content={loan.data.basisPoints / 100 + "%"}
      />
      <meta property="twitter:label3" content="Duration" />
      <meta property="twitter:data3" content={loan.duration} />
    </Head>
  );
};

const LoanLayout = () => {
  const anchorWallet = useAnchorWallet();

  const loanAddress = usePageParam();
  const loanQuery = useLoanQuery(loanAddress);

  const symbol = loanQuery.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const loan = useMemo(() => {
    if (loanQuery.data) {
      return Loan.fromJSON(loanQuery.data);
    }
  }, [loanQuery.data]);

  function renderActiveButton() {
    if (loan && anchorWallet && loan.isBorrower(anchorWallet)) {
      return <RepayButton loan={loan} />;
    } else if (
      loan &&
      loan.expired &&
      anchorWallet &&
      loan.isLender(anchorWallet)
    ) {
      return <RepossessButton loan={loan} />;
    }

    return null;
  }

  function renderListedButton() {
    if (loan && anchorWallet && loan.isBorrower(anchorWallet)) {
      return <CancelButton loan={loan} />;
    } else if (loan) {
      return <LendButton loan={loan} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (loan && anchorWallet && loan.isBorrower(anchorWallet)) {
      return <CloseAccountButton loan={loan} />;
    }

    return null;
  }

  function renderLTV() {
    if (loan?.amount && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (loan.data.amount.toNumber() / floorPriceQuery.data.floorPrice) * 100
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
                Total amount due on {loan.dueDate} will be&nbsp;
                <Text as="span" fontWeight="semibold">
                  {loan.amountOnMaturity}
                </Text>
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderListedButton()}
            </Box>
          </>
        );

      case LoanState.Active:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag colorScheme="green">
                <TagLeftIcon boxSize="12px" as={IoLeaf} />
                <TagLabel>Loan Active</TagLabel>
              </Tag>
              {loan.expired && (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Repayment Overdue</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Repayment {loan.expired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {loan.dueDate}
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

      case LoanState.Repaid:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Loan has ended. The loan was repaid.</Text>
            </Box>
          </>
        );

      case LoanState.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Loan account closed.</Text>
            </Box>
          </>
        );

      case LoanState.Defaulted:
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

  if (loanQuery.isLoading) {
    // TODO skeleton
    return null;
  }

  if (loanQuery.error instanceof Error) {
    return (
      <Container maxW="container.lg">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">{loanQuery.error.message}</Text>
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
          <ListingImage uri={loan?.metadata.data.uri} />
          <ExternalLinks mint={loan?.data.mint} />
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Peer-to-peer Loan
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {loan?.metadata.data.name}
          </Heading>
          <Box mb="8">
            <VerifiedCollection symbol={loan?.metadata.data.symbol} />
          </Box>

          {loan && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Borrowing
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {loan.amount}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Duration
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {loan.duration}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    APY
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {loan.data.basisPoints / 100}%
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

          <Activity mint={loan?.data.mint} />
        </Box>
      </Flex>
    </Container>
  );
};

interface LoanButtonProps {
  loan: Loan;
}

const LendButton = ({ loan }: LoanButtonProps) => {
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
        loan={loan}
        open={open}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(loan.data)}
      />
    </>
  );
};

interface CancelButtonProps {
  loan: Loan;
}

const CancelButton = ({ loan }: CancelButtonProps) => {
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
        onConfirm={() => mutation.mutate(loan.data)}
      />
    </>
  );
};

interface RepayButtonProps {
  loan: Loan;
}

const RepayButton = ({ loan }: RepayButtonProps) => {
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
        loan={loan}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(loan.data)}
      />
    </>
  );
};

interface RepossessButtonProps {
  loan: Loan;
}

const RepossessButton: React.FC<RepossessButtonProps> = ({ loan }) => {
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
        onConfirm={() => mutation.mutate(loan.data)}
      />
    </>
  );
};

interface CloseAcccountButtonProps {
  loan: Loan;
}

export const CloseAccountButton: React.FC<CloseAcccountButtonProps> = ({
  loan,
}) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseLoanMutation(() => setDialog(false));
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
        onConfirm={() => mutation.mutate(loan.data)}
      />
    </>
  );
};

export default LoanPage;
