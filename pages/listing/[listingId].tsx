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
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoLeaf, IoAlert } from "react-icons/io5";

import * as utils from "../../utils";
import { RPC_ENDPOINT } from "../../common/constants";
import { ListingState } from "../../common/types";
import { fetchListing } from "../../common/query";
import { useFloorPriceQuery, useListingQuery } from "../../hooks/query";
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

interface ListingProps {
  initialData: {
    listingResult: {
      publicKey: any;
      listing: any;
      metadata: any;
    };
    jsonMetadata: any;
  } | null;
}

const ListingPage: NextPage<ListingProps> = (props) => {
  return (
    <>
      <ListingHead {...props} />
      <ListingLayout />
    </>
  );
};

ListingPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const pubkey = new anchor.web3.PublicKey(ctx.query.listingId as string);
      const listingResult = await fetchListing(connection, pubkey);
      const jsonMetadata = await fetch(listingResult.metadata.data.uri).then(
        (response) => {
          return response.json().then((data) => data);
        }
      );

      return {
        initialData: {
          listingResult: {
            publicKey: listingResult.publicKey.toBase58(),
            listing: {
              ...listingResult.data,
              amount: listingResult.data.amount.toNumber(),
              borrower: listingResult.data.borrower.toBase58(),
              lender: listingResult.data.lender.toBase58(),
              duration: listingResult.data.duration.toNumber(),
              startDate: listingResult.data.startDate.toNumber(),
              escrow: listingResult.data.escrow.toBase58(),
              mint: listingResult.data.mint.toBase58(),
            },
            metadata: listingResult.metadata.pretty(),
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

const ListingHead = ({ initialData }: ListingProps) => {
  if (initialData) {
    const description = `Borrowring ${utils.formatAmount(
      new anchor.BN(initialData.listingResult.listing.amount)
    )} over ${utils.formatDuration(
      new anchor.BN(initialData.listingResult.listing.duration)
    )}`;

    return (
      <Head>
        <title>{initialData.listingResult.metadata.data.name}</title>
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
          content={`https://dexloan.io/listing/${initialData.listingResult.publicKey}`}
        />
        <meta property="og:image" content={initialData.jsonMetadata.image} />

        <meta
          property="twitter:title"
          content={initialData.jsonMetadata.name}
        />
        <meta property="twitter:description" content={description} />
        <meta
          property="twitter:url"
          content={`https://dexloan.io/listing/${initialData.listingResult.publicKey}`}
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
            new anchor.BN(initialData.listingResult.listing.amount)
          )}
        />
        <meta property="twitter:label2" content="APY" />
        <meta
          property="twitter:data2"
          content={initialData.listingResult.listing.basisPoints / 100 + "%"}
        />
        <meta property="twitter:label3" content="Duration" />
        <meta
          property="twitter:data3"
          content={utils.formatDuration(
            new anchor.BN(initialData.listingResult.listing.duration)
          )}
        />
      </Head>
    );
  }

  return null;
};

const ListingLayout = () => {
  const router = useRouter();
  const { listingId } = router.query;
  const anchorWallet = useAnchorWallet();

  const listingAddress = listingId
    ? new anchor.web3.PublicKey(listingId as string)
    : undefined;
  const listingQuery = useListingQuery(listingAddress);

  const symbol = listingQuery.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const listing = listingQuery.data?.data;
  const metadata = listingQuery.data?.metadata;

  const hasExpired =
    listing?.startDate && utils.hasExpired(listing.startDate, listing.duration);

  const isBorrower =
    listing &&
    listing.borrower.toBase58() === anchorWallet?.publicKey.toBase58();

  function renderCloseAccountButton() {
    if (listing?.mint && isBorrower) {
      return <CloseAccountButton mint={listing.mint} />;
    }

    return null;
  }

  function renderLTV() {
    if (listing?.amount && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (listing.amount.toNumber() / floorPriceQuery.data.floorPrice) * 100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }

  function renderByState() {
    if (listing === undefined) return null;

    switch (listing.state) {
      case ListingState.Listed:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Total amount due on{" "}
                {utils.formatDueDate(
                  new anchor.BN(Date.now() / 1000),
                  listing.duration,
                  false
                )}{" "}
                will be&nbsp;
                <Text as="span" fontWeight="semibold">
                  {utils.formatAmountOnMaturity(
                    listing.amount,
                    listing.duration,
                    listing.basisPoints
                  )}
                </Text>
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderCloseAccountButton()}
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
                  {utils.formatDueDate(listing.startDate, listing.duration)}
                </Text>
                . Failure to repay the loan by this date may result in
                repossession of the NFT by the lender.
              </Text>
            </Box>
            <Box mt="4" mb="4">
              {renderCloseAccountButton()}
            </Box>
          </>
        );

      case ListingState.Repaid:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Listing has ended. The loan was repaid.</Text>
            </Box>
          </>
        );

      case ListingState.Cancelled:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>Listing cancelled.</Text>
            </Box>
          </>
        );

      case ListingState.Defaulted:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50" mb="4">
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

          {listing && (
            <>
              <Flex direction="row" gap="12" mt="12">
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
        Close listing account
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

export default ListingPage;
