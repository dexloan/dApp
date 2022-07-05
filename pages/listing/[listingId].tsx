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
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { IoLeaf, IoAlert } from "react-icons/io5";

import * as utils from "../../common/utils";
import { RPC_ENDPOINT } from "../../common/constants";
import { ListingState } from "../../common/types";
import { Loan, LoanPretty } from "../../common/model";
import { fetchListing } from "../../common/query";
import { useFloorPriceQuery, useListingQuery } from "../../hooks/query";
import { useCloseListingMutation } from "../../hooks/mutation";
import { CancelDialog, CloseAccountDialog } from "../../components/dialog";
import { Activity } from "../../components/activity";
import { ExternalLinks } from "../../components/link";
import { ListingImage } from "../../components/image";
import { VerifiedCollection } from "../../components/collection";
import { EllipsisProgress } from "../../components/progress";

interface ListingProps {
  initialData: {
    listing: LoanPretty;
    jsonMetadata: any;
  } | null;
}

const ListingPage: NextPage<ListingProps> = () => {
  return <ListingLayout />;
};

ListingPage.getInitialProps = async (ctx) => {
  if (typeof window === "undefined") {
    try {
      const connection = new anchor.web3.Connection(RPC_ENDPOINT);
      const pubkey = new anchor.web3.PublicKey(ctx.query.listingId as string);
      const listing = await fetchListing(connection, pubkey);
      const jsonMetadata = await fetch(listing.metadata.data.uri).then(
        (response) => {
          return response.json().then((data) => data);
        }
      );

      return {
        initialData: {
          listing,
          jsonMetadata,
        },
      };
    } catch (err) {
      console.log(err);
    }
  }

  return {
    initialData: null,
  };
};

function usePageParam() {
  const router = useRouter();
  return useMemo(
    () => new anchor.web3.PublicKey(router.query.listingId as string),
    [router]
  );
}

const ListingLayout = () => {
  const router = useRouter();
  const { listingId } = router.query;
  const anchorWallet = useAnchorWallet();

  const listingAddress = usePageParam();
  const listingQuery = useListingQuery(listingAddress);

  const symbol = listingQuery.data?.metadata?.data.symbol;
  const floorPriceQuery = useFloorPriceQuery(symbol);

  const listing = useMemo(() => {
    if (listingQuery.data) {
      return Loan.fromJSON(listingQuery.data);
    }
  }, [listingQuery.data]);

  function renderCloseAccountButton() {
    if (listing && anchorWallet && listing.isBorrower(anchorWallet)) {
      return <CloseAccountButton mint={listing.data.mint} />;
    }

    return null;
  }

  function renderLTV() {
    if (listing?.data.amount && floorPriceQuery.data?.floorPrice) {
      const percentage = Number(
        (listing?.data.amount.toNumber() / floorPriceQuery.data.floorPrice) *
          100
      ).toFixed(2);
      return percentage + "%";
    }

    return <EllipsisProgress />;
  }

  function renderByState() {
    if (listing === undefined) return null;

    switch (listing.data.state) {
      case ListingState.Listed:
        return (
          <>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Total amount due on {listing.dueDate} will be&nbsp;
                <Text as="span" fontWeight="semibold">
                  {listing.amountOnMaturity}
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
              {listing.expired && (
                <Tag colorScheme="red" ml="2">
                  <TagLeftIcon boxSize="12px" as={IoAlert} />
                  <TagLabel>Repayment Overdue</TagLabel>
                </Tag>
              )}
            </Box>
            <Box p="4" borderRadius="lg" bgColor="blue.50">
              <Text>
                Repayment {listing.expired ? "was due before " : "due by "}
                <Text as="span" fontWeight="semibold">
                  {listing.dueDate}
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
          <ListingImage uri={listing?.metadata.data.uri} />
          <ExternalLinks mint={listing?.data.mint} />
        </Box>
        <Box flex={1} width="100%" maxW="xl" pl={{ lg: "12" }} mt="6">
          <Badge colorScheme="green" mb="2">
            Peer-to-peer Listing
          </Badge>
          <Heading as="h1" size="lg" color="gray.700" fontWeight="black">
            {listing?.metadata.data.name}
          </Heading>
          <Box mb="8">
            <VerifiedCollection symbol={listing?.metadata.data.symbol} />
          </Box>

          {listing && (
            <>
              <Flex direction="row" gap="12" mt="12">
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Borrowing
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {listing.amount}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    Duration
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {listing.duration}
                  </Heading>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" color="gray.500">
                    APY
                  </Text>
                  <Heading size="md" fontWeight="bold" mb="6">
                    {listing.data.basisPoints / 100}%
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

          <Activity mint={listing?.data.mint} />
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
