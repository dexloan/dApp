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
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
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
import { VerifiedCollection } from "../components/collection";
import { ListingModal } from "../components/form";
import { EllipsisProgress } from "../components/progress";

const Manage: NextPage = () => {
  const router = useRouter();

  function renderContent() {
    switch (router.query.tab) {
      case "listed":
        return <Listings />;

      case "loans":
        return <Loans />;

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
            Listings
          </Button>
        </NextLink>
        <NextLink href="/manage?tab=loans">
          <Button
            as="a"
            colorScheme={router.query.tab === "loans" ? "green" : undefined}
            cursor="pointer"
          >
            Loans
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
    <Heading color="gray.600" fontWeight="black" fontSize="xl">
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

const Loans = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const loansQuery = useLoansQuery(connection, anchorWallet);

  const activeLoans = useMemo(
    () =>
      loansQuery.data?.filter((l) => l?.listing.state === ListingState.Active),
    [loansQuery.data]
  );

  const totalLending = useMemo(
    () =>
      activeLoans?.reduce((total, item) => {
        if (item) {
          return total.add(item.listing.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [activeLoans]
  );

  if (loansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <SectionHeader
        title="My Active Loans"
        subtitle={
          activeLoans?.length
            ? `Lending ${utils.formatAmount(totalLending)}`
            : null
        }
      />
      {activeLoans?.length ? (
        <CardList>
          {activeLoans?.map(
            (item) =>
              item && (
                <ListedCard
                  key={item.publicKey.toBase58()}
                  listing={item.publicKey}
                  amount={item.listing.amount}
                  basisPoints={item.listing.basisPoints}
                  duration={item.listing.duration}
                  uri={item.metadata.data.uri}
                  name={item.metadata.data.name}
                  symbol={item.metadata.data.symbol}
                />
              )
          )}
        </CardList>
      ) : (
        <Box>
          <Text>
            Why not check out our{" "}
            <NextLink href="/#listings" scroll={false}>
              <Link color="green.600" fontWeight="semibold">
                current listings
              </Link>
            </NextLink>{" "}
            to start lending?
          </Text>
        </Box>
      )}
    </>
  );
};

const Listings = () => {
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const borrowingsQuery = useBorrowingsQuery(connection, anchorWallet);

  const [activeBorrowings, listedBorrowings, completedBorrowings] = useMemo(
    () => [
      borrowingsQuery.data?.filter(
        (b) => b?.listing.state === ListingState.Active
      ),
      borrowingsQuery.data?.filter(
        (b) => b?.listing.state === ListingState.Listed
      ),
      borrowingsQuery.data?.filter(
        (b) =>
          b?.listing.state === ListingState.Defaulted ||
          b?.listing.state === ListingState.Cancelled ||
          b?.listing.state === ListingState.Repaid
      ),
    ],
    [borrowingsQuery.data]
  );

  const totalBorrowings = useMemo(
    () =>
      activeBorrowings?.reduce((total, item) => {
        if (item) {
          return total.add(item.listing.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [activeBorrowings]
  );

  if (borrowingsQuery.isLoading) {
    return <LoadingSpinner />;
  }

  if (
    !activeBorrowings?.length &&
    !listedBorrowings?.length &&
    !completedBorrowings?.length
  ) {
    return (
      <>
        <SectionHeader
          title="My Active Listings"
          subtitle={
            activeBorrowings?.length && totalBorrowings
              ? `Borrowing ${utils.formatAmount(totalBorrowings)}`
              : null
          }
        />
        <Text mb="6">You do not currently have any active listings.</Text>
      </>
    );
  }

  return (
    <Box>
      {activeBorrowings && activeBorrowings.length > 0 && (
        <>
          <SectionHeader
            title="My Active Listings"
            subtitle={
              activeBorrowings?.length && totalBorrowings
                ? `Borrowing ${utils.formatAmount(totalBorrowings)}`
                : null
            }
          />
          <CardList>
            {activeBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item.publicKey.toBase58()}
                    listing={item.publicKey}
                    amount={item.listing.amount}
                    basisPoints={item.listing.basisPoints}
                    duration={item.listing.duration}
                    uri={item.metadata.data.uri}
                    name={item.metadata.data.name}
                    symbol={item.metadata.data.symbol}
                  />
                )
            )}
          </CardList>
        </>
      )}

      {listedBorrowings && listedBorrowings.length > 0 && (
        <>
          <SectionHeader title="My Listed NFTs" />
          <CardList>
            {listedBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item.publicKey.toBase58()}
                    listing={item.publicKey}
                    amount={item.listing.amount}
                    basisPoints={item.listing.basisPoints}
                    duration={item.listing.duration}
                    uri={item.metadata.data.uri}
                    name={item.metadata.data.name}
                    symbol={item.metadata.data.symbol}
                  />
                )
            )}
          </CardList>
        </>
      )}

      {completedBorrowings && completedBorrowings.length > 0 && (
        <>
          <SectionHeader title="My Completed Listings" />
          <CardList>
            {completedBorrowings?.map(
              (item) =>
                item && (
                  <ListedCard
                    key={item.publicKey.toBase58()}
                    listing={item.publicKey}
                    amount={item.listing.amount}
                    basisPoints={item.listing.basisPoints}
                    duration={item.listing.duration}
                    uri={item.metadata.data.uri}
                    name={item.metadata.data.name}
                    symbol={item.metadata.data.symbol}
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

  const collections = useMemo(() => {
    const collectionMap = nftQuery.data?.reduce((cols, nft) => {
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

    return Object.values(collectionMap ?? {}).sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });
  }, [nftQuery.data]);

  if (!nftQuery.isFetched) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {collections?.length ? (
        collections.map((collection) => {
          return (
            <Collection
              key={collection.symbol}
              collection={collection}
              onSelectItem={setSelected}
            />
          );
        })
      ) : (
        <Box>
          <SectionHeader title="My Items" />
          <Text>You do not currently hold any NFTs approved for lending.</Text>
        </Box>
      )}

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
            key={item?.tokenAccount.pubkey.toBase58()}
            uri={item?.metadata.data.uri}
            imageAlt={item?.metadata.data.name}
            onClick={() => onSelectItem(item)}
          >
            <Box p="4" pb="6">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                textAlign="left"
                isTruncated
              >
                {item?.metadata.data.name}
              </Box>
              <VerifiedCollection
                size="xs"
                symbol={item?.metadata.data.symbol}
              />
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
        subtitle={<>Floor Price {floorPrice ?? <EllipsisProgress />}</>}
      />
      <CardList>{collection.items.map(renderItem)}</CardList>
    </>
  );
};

export default Manage;
