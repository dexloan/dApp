import * as anchor from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
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
import { useEffect, useState } from "react";
import { IoLeaf, IoAlert } from "react-icons/io5";
import * as utils from "../../utils";
import { ListingState } from "../../common/types";
import { useListingQuery } from "../../hooks/query";
import {
  useCancelMutation,
  useCloseAccountMutation,
  useLoanMutation,
  useRepaymentMutation,
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

const Listing: NextPage = () => {
  const router = useRouter();
  const { listingId } = router.query;
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const pubkey = listingId
    ? new anchor.web3.PublicKey(listingId as string)
    : undefined;
  const listingQuery = useListingQuery(connection, pubkey);

  const listing = listingQuery.data?.listing;
  const metadata = listingQuery.data?.metadata;

  const hasExpired =
    listing &&
    utils.hasExpired(listing.startDate.toNumber(), listing.duration.toNumber());

  const isLender =
    listing && listing.lender.toBase58() === anchorWallet?.publicKey.toBase58();
  const isBorrower =
    listing &&
    listing.borrower.toBase58() === anchorWallet?.publicKey.toBase58();

  function renderActiveButton() {
    if (listing && pubkey && isBorrower) {
      return (
        <RepayButton
          amount={listing.amount}
          basisPoints={listing.basisPoints}
          duration={listing.duration}
          startDate={listing.startDate}
          escrow={listing.escrow}
          mint={listing.mint}
          listing={pubkey}
          lender={listing.lender}
        />
      );
    } else if (hasExpired && listing && pubkey && isLender) {
      return (
        <RepossessButton
          escrow={listing.escrow}
          mint={listing.mint}
          listing={pubkey}
        />
      );
    }

    return null;
  }

  function renderListedButton() {
    if (listing && pubkey && isBorrower) {
      return (
        <CancelButton
          escrow={listing.escrow}
          mint={listing.mint}
          listing={pubkey}
        />
      );
    } else if (listing && pubkey) {
      return (
        <LoanButton
          listing={pubkey}
          amount={listing.amount}
          borrower={listing.borrower}
          duration={listing.duration}
          basisPoints={listing.basisPoints}
          mint={listing.mint}
        />
      );
    }
    return null;
  }

  function renderCloseAccountButton() {
    if (
      pubkey &&
      listing?.borrower.toBase58() === anchorWallet?.publicKey.toBase58()
    ) {
      return <CloseAccountButton listing={pubkey} />;
    }

    return null;
  }

  function renderByState() {
    if (listing === undefined) return null;

    switch (listing.state) {
      case ListingState.Listed:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                After {utils.formatDuration(listing.duration)} the total
                repayment required will be&nbsp;
                {utils.formatTotalAmount(
                  listing.amount,
                  listing.duration,
                  listing.basisPoints
                )}
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
            <Box pb="4">
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
            <Box pb="4">
              <Text>
                Repayment {hasExpired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {utils.getFormattedDueDate(
                    listing.startDate.toNumber(),
                    listing.duration.toNumber()
                  )}
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
            <Box mb="4">
              <Text>Listing has ended. The loan was repaid.</Text>
            </Box>
            <Box mb="4">{renderCloseAccountButton()}</Box>
          </>
        );

      case ListingState.Cancelled:
        return (
          <>
            <Box mb="4">
              <Text>Listing cancelled.</Text>
            </Box>
            <Box mb="4">{renderCloseAccountButton()}</Box>
          </>
        );

      case ListingState.Defaulted:
        return (
          <>
            <Box mb="4">
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
    <Container maxW="container.xl">
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
        <Box maxW="100%">
          <ListingImage uri={metadata?.data.uri} />
          <ExternalLinks mint={listingQuery.data?.listing.mint} />
        </Box>
        <Box flex={1} maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Peer-to-peer Listing
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {metadata?.data.name}
          </Heading>
          <VerifiedCollection symbol={metadata?.data.symbol} />

          {listing && (
            <Flex direction="row" gap="12" mt="12" mb="12">
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">
                  Borrowing
                </Text>
                <Heading size="md" fontWeight="bold" mb="6">
                  {utils.formatAmount(listing.amount)}
                </Heading>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">
                  Duration
                </Text>
                <Heading size="md" fontWeight="bold" mb="6">
                  {utils.formatDuration(listing.duration)}
                </Heading>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" color="gray.500">
                  APY
                </Text>
                <Heading size="md" fontWeight="bold" mb="6">
                  {listing.basisPoints / 100}%
                </Heading>
              </Box>
            </Flex>
          )}

          {renderByState()}

          <Activity mint={listingQuery.data?.listing.mint} />
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
  listing: anchor.web3.PublicKey;
}

const LoanButton = ({
  amount,
  basisPoints,
  duration,
  mint,
  borrower,
  listing,
}: LoanButtonProps) => {
  const [open, setDialog] = useState(false);
  const mutation = useLoanMutation(() => setDialog(false));
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
            listing,
          })
        }
      />
    </>
  );
};

interface CancelButtonProps {
  mint: anchor.web3.PublicKey;
  escrow: anchor.web3.PublicKey;
  listing: anchor.web3.PublicKey;
}

const CancelButton = ({ mint, escrow, listing }: CancelButtonProps) => {
  const [dialog, setDialog] = useState(false);
  const mutation = useCancelMutation(() => setDialog(false));
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
        onConfirm={() => mutation.mutate({ mint, escrow, listing })}
      />
    </>
  );
};

interface RepayButtonProps extends Omit<LoanButtonProps, "borrower"> {
  startDate: anchor.BN;
  lender: anchor.web3.PublicKey;
  escrow: anchor.web3.PublicKey;
}

const RepayButton = ({
  amount,
  basisPoints,
  duration,
  startDate,
  mint,
  escrow,
  listing,
  lender,
}: RepayButtonProps) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useRepaymentMutation(() => setDialog(false));
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
            escrow,
            listing,
            lender,
          })
        }
      />
    </>
  );
};

interface RepossessButtonProps {
  mint: anchor.web3.PublicKey;
  escrow: anchor.web3.PublicKey;
  listing: anchor.web3.PublicKey;
}

const RepossessButton: React.FC<RepossessButtonProps> = ({
  mint,
  escrow,
  listing,
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
            escrow,
            listing,
          })
        }
      />
    </>
  );
};

interface CloseAcccountButtonProps {
  listing: anchor.web3.PublicKey;
}

export const CloseAccountButton: React.FC<CloseAcccountButtonProps> = ({
  listing,
}) => {
  const router = useRouter();
  const [dialog, setDialog] = useState(false);
  const mutation = useCloseAccountMutation(() => setDialog(false));
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
        Close listing account
      </Button>
      <CloseAccountDialog
        open={dialog}
        loading={mutation.isLoading}
        onRequestClose={() => setDialog(false)}
        onConfirm={() =>
          mutation.mutate({
            listing,
          })
        }
      />
    </>
  );
};

export default Listing;
