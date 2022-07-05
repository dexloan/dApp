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
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
import { IoChevronDown } from "react-icons/io5";
import * as utils from "../common/utils";
import { Collection, CollectionMap, NFTResult } from "../common/types";
import { Loan, CallOption } from "../common/model";
import {
  useNFTByOwnerQuery,
  useFloorPriceQuery,
  useBorrowingsQuery,
  usePersonalLoansQuery,
  useBuyerCallOptionsQuery,
  useSellerCallOptionsQuery,
  // Deprecated
  usePersonalListingsQuery,
} from "../hooks/query";
import {
  Card,
  CardList,
  LoanCard,
  ListingCard,
  CallOptionCard,
} from "../components/card";
import { VerifiedCollection } from "../components/collection";
import { InitCallOptionModal, InitLoanModal } from "../components/form";
import { EllipsisProgress } from "../components/progress";

const Manage: NextPage = () => {
  const router = useRouter();

  function renderContent() {
    switch (router.query.tab) {
      case "loans":
        return <Loans />;

      case "call_options":
        return <CallOptions />;

      default:
        return <MyItems />;
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
            My Items
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
        <NextLink href="/manage?tab=call_options">
          <Button
            as="a"
            colorScheme={
              router.query.tab === "call_options" ? "green" : undefined
            }
            cursor="pointer"
          >
            Call Options
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
  const loansQuery = usePersonalLoansQuery();
  const borrowingsQuery = useBorrowingsQuery();
  // Deprecated listings
  const listingsQuery = usePersonalListingsQuery();

  const loans = useMemo(
    () => loansQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [loansQuery.data]
  );

  const borrowings = useMemo(
    () => borrowingsQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [borrowingsQuery.data]
  );

  const deprecatedListings = useMemo(
    () => listingsQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [listingsQuery.data]
  );

  const totalLending = useMemo(
    () =>
      loans?.reduce((total, item) => {
        if (item) {
          return total.add(item.data.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [loans]
  );

  const totalBorrowing = useMemo(
    () =>
      borrowings?.reduce((total, item) => {
        if (item) {
          return total.add(item.data.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [borrowings]
  );

  if (loansQuery.isLoading) {
    return <LoadingSpinner />;
  }

  console.log(borrowingsQuery);

  return (
    <>
      {loans.length ? (
        <>
          <SectionHeader
            title="My Loans"
            subtitle={
              loans.length
                ? `Lending ${utils.formatAmount(totalLending)}`
                : null
            }
          />
          <CardList>
            {loans.map((item) => (
              <LoanCard key={item.publicKey.toBase58()} loan={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {borrowings.length ? (
        <>
          <SectionHeader
            title="My Borrowings"
            subtitle={
              borrowings.length
                ? `Borrowing ${utils.formatAmount(totalBorrowing)}`
                : null
            }
          />
          <CardList>
            {borrowings.map((item) => (
              <LoanCard key={item.publicKey.toBase58()} loan={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {!loans.length && !borrowings.length && (
        <>
          <SectionHeader title="My Loans" />
          <Box mb="12">
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
        </>
      )}

      {deprecatedListings.length ? (
        <>
          <SectionHeader
            title="Deprecated V1 Listings"
            subtitle="Please close the following accounts"
          />
          <CardList>
            {deprecatedListings.map((item) => (
              <ListingCard key={item.publicKey.toBase58()} listing={item} />
            ))}
          </CardList>
        </>
      ) : null}
    </>
  );
};

const CallOptions = () => {
  const buyerQueryResult = useBuyerCallOptionsQuery();
  const sellerQueryResult = useSellerCallOptionsQuery();

  const buyerLoans = useMemo(() => {
    if (buyerQueryResult.data) {
      return buyerQueryResult.data.map(CallOption.fromJSON);
    }
    return [];
  }, [buyerQueryResult.data]);

  const sellerLoans = useMemo(() => {
    if (sellerQueryResult.data) {
      return sellerQueryResult.data.map(CallOption.fromJSON);
    }
    return [];
  }, [sellerQueryResult.data]);

  if (buyerQueryResult.isLoading || sellerQueryResult.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {buyerLoans.length ? (
        <>
          <SectionHeader title="Your Call Options" />
          <CardList>
            {buyerLoans.map((item) => (
              <CallOptionCard
                key={item.publicKey.toBase58()}
                callOption={item}
              />
            ))}
          </CardList>
        </>
      ) : null}

      {sellerLoans.length ? (
        <>
          <SectionHeader title="Sold" />
          <CardList>
            {sellerLoans.map((item) => (
              <CallOptionCard
                key={item.publicKey.toBase58()}
                callOption={item}
              />
            ))}
          </CardList>
        </>
      ) : null}

      {!buyerLoans.length && !sellerLoans.length && (
        <>
          <SectionHeader title="Your Call Options" />
          <Box>
            <Text>
              Why not check out our{" "}
              <NextLink href="/#listings" scroll={false}>
                <Link color="green.600" fontWeight="semibold">
                  current listings
                </Link>
              </NextLink>{" "}
              to start buying?
            </Text>
          </Box>
        </>
      )}
    </>
  );
};

const MyItems = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [selected, setSelected] = useState<NFTResult | null>(null);
  const [type, setType] = useState<"loan" | "callOption">("loan");
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
              onSelectItem={(item, type) => {
                setSelected(item);
                setType(type);
              }}
            />
          );
        })
      ) : (
        <Box>
          <SectionHeader title="My Items" />
          <Text>You do not currently hold any NFTs approved for lending.</Text>
        </Box>
      )}

      <InitLoanModal
        selected={selected && type === "loan" ? selected : null}
        onRequestClose={() => setSelected(null)}
      />

      <InitCallOptionModal
        selected={selected && type === "callOption" ? selected : null}
        onRequestClose={() => setSelected(null)}
      />
    </>
  );
};

interface CollectionProps {
  collection: Collection;
  onSelectItem: (item: NFTResult, type: "loan" | "callOption") => void;
}

const Collection = ({ collection, onSelectItem }: CollectionProps) => {
  const floorPriceQuery = useFloorPriceQuery(collection.symbol);

  const renderItem = useCallback(
    (item: NFTResult) => {
      return (
        <Card
          key={item?.tokenAccount.pubkey.toBase58()}
          uri={item?.metadata.data.uri}
          imageAlt={item?.metadata.data.name}
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
            <VerifiedCollection size="xs" symbol={item?.metadata.data.symbol} />
          </Box>
          <Box m="2">
            <Menu isLazy>
              <MenuButton
                as={Button}
                rightIcon={<IoChevronDown />}
                width="100%"
                textAlign="left"
                colorScheme="green"
              >
                List Item
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => onSelectItem(item, "loan")}>
                  Borrow Against
                </MenuItem>
                <MenuItem onClick={() => onSelectItem(item, "callOption")}>
                  Sell Call Option
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Card>
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
