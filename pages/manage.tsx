import * as anchor from "@project-serum/anchor";
import type { NextPage } from "next";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useRef, useState } from "react";
import * as utils from "../utils";
import {
  ListingState,
  Collection,
  CollectionMap,
  NFTResult,
} from "../common/types";
import {
  useBorrowingsQuery,
  useLoansQuery,
  useNFTByOwnerQuery,
  useFloorPriceQuery,
} from "../hooks/query";
import { Card, CardList, ListedCard } from "../components/card";
import { ListingModal } from "../components/form";

const Manage: NextPage = () => {
  const router = useRouter();

  function renderContent() {
    switch (router.query.tab) {
      case "listed":
        return <MyListings />;

      case "loans":
        return <MyLoans />;

      default:
        return <Borrow />;
    }
  }

  return (
    <Container maxW="container.xl">
      <ButtonGroup mb="12">
        <NextLink href="/manage">
          <Button
            as="a"
            colorScheme={router.query.tab === undefined ? "green" : undefined}
            cursor="pointer"
          >
            Borrow
          </Button>
        </NextLink>
        <NextLink href="/manage?tab=listed">
          <Button
            as="a"
            colorScheme={router.query.tab === "listed" ? "green" : undefined}
            cursor="pointer"
          >
            My Listings
          </Button>
        </NextLink>
        <NextLink href="/manage?tab=loans">
          <Button
            as="a"
            colorScheme={router.query.tab === "loans" ? "green" : undefined}
            cursor="pointer"
          >
            My Loans
          </Button>
        </NextLink>
      </ButtonGroup>
      {renderContent()}
    </Container>
  );
};

const SectionHeader = ({
  title,
  subtitle,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}) => (
  <Box mb="4">
    <Heading color="gray.700" fontWeight="bold" fontSize="xl">
      {title}
    </Heading>
    {subtitle && (
      <Text fontSize="sm" fontWeight="medium">
        {subtitle}
      </Text>
    )}
  </Box>
);

const LoadingSpinner = () => (
  <Flex pt="12" pb="12" justify="center">
    <Spinner color="green" size="md" thickness="4px" />
  </Flex>
);

const MyLoans = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const loansQuery = useLoansQuery(connection, anchorWallet);

  const activeLoans = loansQuery.data?.filter(
    (l) => l?.listing.account.state === ListingState.Active
  );

  if (loansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SectionHeader title="Active Loans" />
      <CardList>
        {activeLoans?.map(
          (item) =>
            item && (
              <ListedCard
                key={item?.listing.publicKey.toBase58()}
                listing={item?.listing.publicKey}
                amount={item?.listing.account.amount}
                basisPoints={item?.listing.account.basisPoints}
                duration={item?.listing.account.duration}
                uri={item?.metadata.data.uri}
                name={item?.metadata.data.name}
              />
            )
        )}
      </CardList>
    </>
  );
};

const MyListings = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const borrowingsQuery = useBorrowingsQuery(connection, anchorWallet);

  const [activeBorrowings, listedBorrowings, completedBorrowings] = useMemo(
    () => [
      borrowingsQuery.data?.filter(
        (b) => b?.listing.account.state === ListingState.Active
      ),
      borrowingsQuery.data?.filter(
        (b) => b?.listing.account.state === ListingState.Listed
      ),
      borrowingsQuery.data?.filter(
        (b) =>
          b?.listing.account.state === ListingState.Defaulted ||
          b?.listing.account.state === ListingState.Cancelled ||
          b?.listing.account.state === ListingState.Repaid
      ),
    ],
    [borrowingsQuery.data]
  );

  const totalBorrowings = useMemo(
    () =>
      activeBorrowings?.reduce((total, item) => {
        if (item) {
          return total.add(item.listing.account.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [activeBorrowings]
  );

  if (borrowingsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {activeBorrowings && activeBorrowings?.length > 0 && (
        <>
          <SectionHeader
            title="Your Active Listings"
            subtitle={`Borrowing ${
              totalBorrowings && utils.formatAmount(totalBorrowings)
            }`}
          />
          <CardList>
            {activeBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item?.listing.publicKey.toBase58()}
                    listing={item?.listing.publicKey}
                    amount={item?.listing.account.amount}
                    basisPoints={item?.listing.account.basisPoints}
                    duration={item?.listing.account.duration}
                    uri={item?.metadata.data.uri}
                    name={item?.metadata.data.name}
                  />
                )
            )}
          </CardList>
        </>
      )}
      {completedBorrowings && completedBorrowings.length > 0 && (
        <>
          <SectionHeader title="Completed Listings" />
          <CardList>
            {completedBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item?.listing.publicKey.toBase58()}
                    listing={item?.listing.publicKey}
                    amount={item?.listing.account.amount}
                    basisPoints={item?.listing.account.basisPoints}
                    duration={item?.listing.account.duration}
                    uri={item?.metadata.data.uri}
                    name={item?.metadata.data.name}
                  />
                )
            )}
          </CardList>
        </>
      )}
      {listedBorrowings && listedBorrowings.length > 0 && (
        <>
          <SectionHeader title="Your Listed NFTs" />
          <CardList>
            {listedBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item?.listing.publicKey.toBase58()}
                    listing={item?.listing.publicKey}
                    amount={item?.listing.account.amount}
                    basisPoints={item?.listing.account.basisPoints}
                    duration={item?.listing.account.duration}
                    uri={item?.metadata.data.uri}
                    name={item?.metadata.data.name}
                  />
                )
            )}
          </CardList>
        </>
      )}
    </Box>
  );
};

const Borrow = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [selected, setSelected] = useState<NFTResult | null>(null);

  const nftQuery = useNFTByOwnerQuery(connection, wallet);

  const collectionMap = useMemo(() => {
    return nftQuery.data?.reduce((cols, nft) => {
      if (nft) {
        const symbol = nft.metadata.data.symbol;

        if (cols[symbol]) {
          cols[symbol].items.push(nft);
        }

        if (!cols[symbol]) {
          cols[symbol] = {
            symbol,
            name: utils.mapSymbolToCollectionTitle(symbol) as string,
            items: [nft],
          };
        }
      }
      return cols;
    }, {} as CollectionMap);
  }, [nftQuery.data]);

  if (nftQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {collectionMap &&
        Object.values(collectionMap).map((collection) => {
          return (
            <Collection
              key={collection.name}
              collection={collection}
              onSelectItem={setSelected}
            />
          );
        })}

      <ListingModal
        selected={selected}
        onRequestClose={() => setSelected(null)}
      />
    </>
  );
};

interface CollectionProps {
  collection: Collection;
  onSelectItem: (item: NFTResult) => void;
}

const Collection = ({ collection, onSelectItem }: CollectionProps) => {
  const floorPriceQuery = useFloorPriceQuery(collection.symbol);

  const renderItem = useCallback(
    (item: NFTResult) => {
      return (
        item?.metadata.data.uri &&
        item?.metadata.data.name && (
          <Card
            key={item?.accountInfo.pubkey.toBase58()}
            uri={item?.metadata.data.uri}
            imageAlt={item?.metadata.data.name}
            onClick={() => onSelectItem(item)}
          >
            <Box p="4">
              <Box
                mt="1"
                mb="2"
                fontWeight="semibold"
                as="h4"
                textAlign="left"
                isTruncated
              >
                {item?.metadata.data.name}
              </Box>
            </Box>
          </Card>
        )
      );
    },
    [onSelectItem]
  );

  const floorPrice = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return utils.formatAmount(new anchor.BN(floorPriceQuery.data.floorPrice));
    }
  }, [floorPriceQuery.data]);

  return (
    <>
      <SectionHeader
        title={collection.name}
        subtitle={
          floorPriceQuery.isLoading ? (
            <Spinner colorScheme="green" size="xs" thickness="2px" />
          ) : (
            `Floor Price ${floorPrice}`
          )
        }
      />
      <CardList>{collection.items.map(renderItem)}</CardList>
    </>
  );
};

export default Manage;
