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
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert } from "react-icons/io5";

import { BACKEND_RPC_ENDPOINT } from "../../common/constants";
import { LoanStateEnum } from "../../common/types";
import { fetchLoan } from "../../common/query";
import { Loan } from "../../common/model";
import {
  getLoanCacheKey,
  getMetadataFileCacheKey,
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
import { NFTLayout } from "../../components/layout";
import { SecondaryHireButton } from "../../components/buttons";
import { EllipsisProgress } from "../../components/progress";
import { DocumentHead } from "../../components/document";
import { Detail } from "../../components/detail";

interface LoanProps {
  dehydratedState: DehydratedState | undefined;
}

const LoanPage: NextPage<LoanProps> = () => {
  const loanAddress = usePageParam();
  const loanQueryResult = useLoanQuery(loanAddress);
  const metadataQuery = useMetadataFileQuery(
    loanQueryResult.data?.metadata.data.uri
  );
  const jsonMetadata = metadataQuery.data;

  const loan = useMemo(() => {
    if (loanQueryResult.data) {
      return Loan.fromJSON(loanQueryResult.data);
    }
  }, [loanQueryResult.data]);

  if (loanQueryResult.error instanceof Error) {
    return (
      <Container maxW="container.md">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">{loanQueryResult.error.message}</Text>
          </Flex>
        </Box>
      </Container>
    );
  }

  if (!loan || !jsonMetadata) {
    return null;
  }

  return (
    <>
      <DocumentHead
        title={loan.metadata.data.name}
        description={`Borrowring ${loan.amount} over ${loan.duration}`}
        image={jsonMetadata.image}
        imageAlt={loan.metadata.data.name}
        url={`loan/${loan.publicKey.toBase58()}`}
        twitterLabels={[
          { label: "Amount", value: loan.amount || "" },
          { label: "APY", value: loan.apy },
          { label: "Duration", value: loan.duration },
        ]}
      />
      <LoanLayout />
    </>
  );
};

LoanPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const queryClient = new QueryClient();
      const connection = new anchor.web3.Connection(BACKEND_RPC_ENDPOINT);
      const loanAddress = new anchor.web3.PublicKey(ctx.query.loanId as string);

      const loan = await queryClient.fetchQuery(
        getLoanCacheKey(loanAddress),
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
    if (anchorWallet && loan?.isBorrower(anchorWallet)) {
      return <RepayButton loan={loan} />;
    } else if (anchorWallet && loan?.expired && loan?.isLender(anchorWallet)) {
      return <RepossessButton loan={loan} />;
    }

    return null;
  }

  function renderListedButton() {
    if (anchorWallet && loan?.isBorrower(anchorWallet)) {
      return <CancelButton loan={loan} />;
    } else if (loan) {
      return <LendButton loan={loan} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (anchorWallet && loan?.isBorrower(anchorWallet)) {
      return <CloseAccountButton loan={loan} />;
    }

    return null;
  }

  const currentLTV = useMemo(() => {
    if (loan?.data?.amount && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (loan.data.amount.toNumber() / floorPriceQuery.data.floorPrice) * 100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }, [loan?.data, floorPriceQuery.data]);

  function renderByState() {
    if (loan === undefined) return null;

    switch (loan.state) {
      case LoanStateEnum.Listed:
        return (
          <>
            <Detail
              footer={
                <Box mt="4" mb="4">
                  {renderListedButton()}
                </Box>
              }
            >
              Total amount due for repayment by {loan.dueDate} will be&nbsp;
              <Text as="span" fontWeight="semibold">
                {loan.amountOnMaturity}
              </Text>
              . Failure to repay the loan by this date may result in
              repossession of the NFT by the lender.
            </Detail>
          </>
        );

      case LoanStateEnum.Active:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag>
                <TagLeftIcon boxSize="12px" as={IoLeaf} />
                <TagLabel>Loan Active</TagLabel>
              </Tag>
              {loan.expired && (
                <Tag ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Repayment Overdue</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.900">
              <Text>
                Repayment {loan.expired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {loan.dueDateAndTime}
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

      case LoanStateEnum.Repaid:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.900">
              <Text>Loan has ended. The loan was repaid.</Text>
            </Box>
          </>
        );

      case LoanStateEnum.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.900">
              <Text>Loan account closed.</Text>
            </Box>
          </>
        );

      case LoanStateEnum.Defaulted:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.900" mb="4">
              <Text>
                Listing has ended. The NFT was repossessed by the lender.
              </Text>
            </Box>
            <Box marginY="size-200">{renderCloseAccountButton()}</Box>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <NFTLayout
      metadata={loan?.metadata}
      stats={
        loan
          ? [
              [
                { label: "Borrowing", value: loan.amount },
                { label: "Duration", value: loan.duration },
                { label: "APY", value: loan.apy },
              ],
              [{ label: "Loan to Floor Value", value: currentLTV }],
            ]
          : undefined
      }
      action={renderByState()}
    />
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
      <Button color="blue.900" w="100%" onClick={onLend}>
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
      <Button color="gray.200" w="100%" onClick={onCancel}>
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
      <Button color="gray.200" w="100%" onClick={onRepay}>
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
      <Button color="gray.200" w="100%" onClick={onRepossess}>
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
      <Button color="gray.200" w="100%" onClick={onClose}>
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
