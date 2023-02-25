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
import { LoanState } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { dehydrate, DehydratedState, QueryClient } from "react-query";
import { IoLeaf, IoAlert } from "react-icons/io5";

import * as utils from "../../../common/utils";
import {
  fetchLoan,
  useLoanQuery,
  useMetadataFileQuery,
} from "../../../hooks/query";
import {
  useAmount,
  useAPY,
  useDuration,
  useDueDate,
  useLTV,
  useIsExpired,
  useAmpuntOnMaturity,
} from "../../../hooks/render";
import {
  useCloseLoanMutation,
  useGiveLoanMutation,
  useRepayLoanMutation,
  useRepossessMutation,
} from "../../../hooks/mutation";
import {
  CancelDialog,
  CloseAccountDialog,
  LoanDialog,
  RepayDialog,
  RepossessDialog,
} from "../../../components/dialog";
import { NftLayout } from "../../../components/layout";
import { DocumentHead } from "../../../components/document";
import { Detail } from "../../../components/detail";
import { LoanJson } from "../../../common/types";

interface LoanProps {
  dehydratedState: DehydratedState | undefined;
}

const LoanPage: NextPage<LoanProps> = () => {
  const loanPda = usePageParam();
  const loanQueryResult = useLoanQuery(loanPda);
  const metadataQuery = useMetadataFileQuery(loanQueryResult.data?.uri);
  const loan = loanQueryResult.data;
  const jsonMetadata = metadataQuery.data;

  if (loanQueryResult.isLoading || metadataQuery.isLoading) {
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

  if (loanQueryResult.error || !loan || !jsonMetadata) {
    return (
      <Container maxW="container.md">
        <Box mt="2">
          <Flex direction="column" alignItems="center">
            <Heading size="xl" fontWeight="black" mt="6" mb="6">
              404 Error
            </Heading>
            <Text fontSize="lg">
              {loanQueryResult.error instanceof Error
                ? loanQueryResult.error.message
                : `Loan with address ${loanPda} not found`}
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
        description={`Borrowring ${loan.amount} over ${loan.duration}`}
        image={jsonMetadata.image}
        imageAlt={jsonMetadata.name}
        url={`loan/${loan.address}`}
        twitterLabels={[
          { label: "Amount", value: loan.amount || "" },
          {
            label: "APY",
            value: utils.formatBasisPoints(
              loan.basisPoints + loan.Collection.loanBasisPoints
            ),
          },
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
      const loanAddress = new anchor.web3.PublicKey(ctx.query.loanId as string);

      const loan = await queryClient.fetchQuery(
        ["loan", loanAddress.toBase58()],
        () => fetchLoan(loanAddress.toBase58())
      );

      await queryClient.prefetchQuery(["metadata_file", loan.uri], () =>
        fetch(loan.uri).then((res) => res.json())
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
  return router.query.loanId as string | undefined;
}

const LoanLayout = () => {
  const anchorWallet = useAnchorWallet();

  const loanAddress = usePageParam();
  const loanQuery = useLoanQuery(loanAddress);
  const metadataQuery = useMetadataFileQuery(loanQuery.data?.uri);
  const loan = loanQuery.data;
  const jsonMetadata = metadataQuery.data;

  const isExpired = useIsExpired(loan);
  const isBorrower =
    anchorWallet && anchorWallet.publicKey.toBase58() === loan?.borrower;
  const isLender =
    anchorWallet && anchorWallet.publicKey.toBase58() === loan?.lender;

  const ltv = useLTV(loan);
  const apy = useAPY(loan);
  const amount = useAmount(loan);
  const duration = useDuration(loan);
  const amountOnMaturity = useAmpuntOnMaturity(loan);
  const dueDate = useDueDate({ loan });
  const dueDateWithTime = useDueDate({ loan, displayTime: true });

  function renderActiveButton() {
    if (isBorrower) {
      return <RepayButton loan={loan} />;
    } else if (isExpired && isLender) {
      return <RepossessButton loan={loan} />;
    }

    return null;
  }

  function renderListedButton() {
    if (isBorrower) {
      return <CancelButton loan={loan} />;
    } else if (loan) {
      return <LendButton loan={loan} />;
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (isBorrower) {
      return <CloseAccountButton loan={loan} />;
    }

    return null;
  }

  function renderByState() {
    if (loan === undefined) return null;

    switch (loan.state) {
      case LoanState.Listed:
        return (
          <Detail
            footer={
              <Box mt="4" mb="4">
                {renderListedButton()}
              </Box>
            }
          >
            Total amount due for repayment by {dueDate} will be&nbsp;
            <Text as="span" fontWeight="semibold">
              {amountOnMaturity}
            </Text>
            . Failure to repay the loan by this date may result in repossession
            of the NFT by the lender.
          </Detail>
        );

      case LoanState.Active:
        return (
          <>
            <Box display="flex" pb="4">
              <Tag>
                <TagLeftIcon boxSize="12px" as={IoLeaf} />
                <TagLabel>Loan Active</TagLabel>
              </Tag>
              {isExpired && (
                <Tag ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Repayment Overdue</TagLabel>
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
                Repayment {isExpired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {dueDateWithTime}
                </Text>
                . Failure to repay the loan by this date may result in
                repossession of the NFT by the lender.
              </Text>
            </Detail>
          </>
        );

      case LoanState.Repaid:
        return (
          <>
            <Detail>
              <Text>Loan has ended. The loan was repaid.</Text>
            </Detail>
          </>
        );

      case LoanState.Defaulted:
        return (
          <>
            <Detail
              footer={
                <Box mt="4" mb="4">
                  {renderCloseAccountButton()}
                </Box>
              }
            >
              <Text>
                Listing has ended. The NFT was repossessed by the lender.
              </Text>
            </Detail>
          </>
        );

      case "Cancelled":
        return (
          <>
            <Detail>
              <Text>Loan account closed.</Text>
            </Detail>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <NftLayout
      mint={loan?.mint}
      metadataJson={jsonMetadata}
      collection={loan?.Collection}
      stats={
        loan
          ? [
              [
                { label: "Borrowing", value: amount },
                { label: "Duration", value: duration },
                { label: "APY", value: apy.total },
              ],
              [{ label: "Loan to Floor Value", value: ltv }],
            ]
          : undefined
      }
      action={renderByState()}
    />
  );
};

interface LoanButtonProps {
  loan: LoanJson;
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
      <Button variant="primary" w="100%" onClick={onLend}>
        Lend SOL
      </Button>
      <LoanDialog
        loan={loan}
        open={open}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(loan)}
      />
    </>
  );
};

interface CancelButtonProps {
  loan: LoanJson;
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
        onConfirm={() => mutation.mutate(loan)}
      />
    </>
  );
};

interface RepayButtonProps {
  loan: LoanJson;
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

  return (
    <>
      <Button variant="primary" w="100%" onClick={onRepay}>
        Repay Loan
      </Button>
      <RepayDialog
        open={dialog}
        loading={mutation.isLoading}
        loan={loan}
        onRequestClose={() => setDialog(false)}
        onConfirm={() => mutation.mutate(loan)}
      />
    </>
  );
};

interface RepossessButtonProps {
  loan: LoanJson;
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
        onConfirm={() => mutation.mutate(loan)}
      />
    </>
  );
};

interface CloseAcccountButtonProps {
  loan: LoanJson;
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
        onConfirm={() => mutation.mutate(loan)}
      />
    </>
  );
};

export default LoanPage;
