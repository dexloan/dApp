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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useMemo, useState } from "react";
import { IoBicycle, IoCalendar, IoCash } from "react-icons/io5";
import * as utils from "../common/utils";
import {
  CallOptionStateEnum,
  Collection,
  CollectionMap,
  HireStateEnum,
  LoanStateEnum,
  NFTResult,
} from "../common/types";
import { Loan, CallOption, Hire } from "../common/model";
import {
  useNFTByOwnerQuery,
  useFloorPriceQuery,
  useLoansTakeQuery,
  useLoansGivenQuery,
  useBuyerCallOptionsQuery,
  useSellerCallOptionsQuery,
  useLenderHiresQuery,
  useBorrowerHiresQuery,
  // Deprecated
  // usePersonalListingsQuery,
} from "../hooks/query";
import {
  Card,
  CardList,
  HireCard,
  LoanCard,
  CallOptionCard,
} from "../components/card";
import { VerifiedCollection } from "../components/collection";
import {
  InitCallOptionModal,
  InitLoanModal,
  InitHireModal,
} from "../components/form";
import { EllipsisProgress } from "../components/progress";

const Manage: NextPage = () => {
  const router = useRouter();

  function renderContent() {
    switch (router.query.tab) {
      case "loans":
        return <Loans />;

      case "call_options":
        return <CallOptions />;

      case "rentals":
        return <Hires />;

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
        <NextLink href="/manage?tab=rentals">
          <Button
            as="a"
            colorScheme={router.query.tab === "rentals" ? "green" : undefined}
            cursor="pointer"
          >
            Rentals
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
  const loansGivenQuery = useLoansGivenQuery();
  const loansTakenQuery = useLoansTakeQuery();
  // Deprecated listings
  // const listingsQuery = usePersonalListingsQuery();

  const givenLoans = useMemo(
    () => loansGivenQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [loansGivenQuery.data]
  );

  const borrowings = useMemo(
    () => loansTakenQuery.data?.map((l) => Loan.fromJSON(l)) || [],
    [loansTakenQuery.data]
  );

  const listedBorrowings = useMemo(
    () => borrowings.filter((b) => b.state !== LoanStateEnum.Active),
    [borrowings]
  );

  const activeBorrowings = useMemo(
    () => borrowings.filter((b) => b.state === LoanStateEnum.Active),
    [borrowings]
  );

  // const deprecatedListings = useMemo(
  //   () => listingsQuery.data?.map((l) => Listing.fromJSON(l)) || [],
  //   [listingsQuery.data]
  // );

  const totalLending = useMemo(
    () =>
      givenLoans?.reduce((total, item) => {
        if (item) {
          return total.add(item.data.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [givenLoans]
  );

  const totalBorrowing = useMemo(
    () =>
      activeBorrowings?.reduce((total, item) => {
        if (item) {
          return total.add(item.data.amount);
        }
        return total;
      }, new anchor.BN(0)),
    [activeBorrowings]
  );

  if (loansTakenQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {listedBorrowings.length ? (
        <>
          <SectionHeader title="Listed items" />
          <CardList>
            {listedBorrowings.map((item) => (
              <LoanCard key={item.publicKey.toBase58()} loan={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {activeBorrowings.length ? (
        <>
          <SectionHeader
            title="Loans taken"
            subtitle={
              activeBorrowings.length
                ? `Borrowing ${utils.formatAmount(totalBorrowing)}`
                : null
            }
          />
          <CardList>
            {activeBorrowings.map((item) => (
              <LoanCard key={item.publicKey.toBase58()} loan={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {givenLoans.length ? (
        <>
          <SectionHeader
            title="Loans given"
            subtitle={
              givenLoans.length
                ? `Lending ${utils.formatAmount(totalLending)}`
                : null
            }
          />
          <CardList>
            {givenLoans.map((item) => (
              <LoanCard key={item.publicKey.toBase58()} loan={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {!givenLoans.length && !borrowings.length && (
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

      {/* {deprecatedListings.length ? (
        <>
          <SectionHeader
            title="Deprecated v1 Listings"
            subtitle="Please close the following accounts"
          />
          <CardList>
            {deprecatedListings.map((item) => (
              <ListingCard key={item.publicKey.toBase58()} listing={item} />
            ))}
          </CardList>
        </>
      ) : null} */}
    </>
  );
};

const CallOptions = () => {
  const buyerQueryResult = useBuyerCallOptionsQuery();
  const sellerQueryResult = useSellerCallOptionsQuery();

  /// Options the user has bought
  const buyerCallOptions = useMemo(() => {
    if (buyerQueryResult.data) {
      return buyerQueryResult.data.map(CallOption.fromJSON);
    }
    return [];
  }, [buyerQueryResult.data]);

  /// Options the user has listed or sold
  const sellerCallOptions = useMemo(() => {
    if (sellerQueryResult.data) {
      return sellerQueryResult.data.map(CallOption.fromJSON);
    }
    return [];
  }, [sellerQueryResult.data]);

  const listedSellerCallOptions = useMemo(() => {
    return sellerCallOptions.filter(
      (option) => option.state === CallOptionStateEnum.Listed
    );
  }, [sellerCallOptions]);

  const activeSellerCallOptions = useMemo(() => {
    return sellerCallOptions.filter(
      (option) => option.state === CallOptionStateEnum.Active
    );
  }, [sellerCallOptions]);

  const otherSellerCallOptions = useMemo(() => {
    return sellerCallOptions.filter(
      (option) =>
        option.state !== CallOptionStateEnum.Active &&
        option.state !== CallOptionStateEnum.Listed
    );
  }, [sellerCallOptions]);

  if (buyerQueryResult.isLoading || sellerQueryResult.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {listedSellerCallOptions.length ? (
        <>
          <SectionHeader title="Listed Items" />
          <CardList>
            {listedSellerCallOptions.map((item) => (
              <CallOptionCard
                key={item.publicKey.toBase58()}
                callOption={item}
              />
            ))}
          </CardList>
        </>
      ) : null}

      {activeSellerCallOptions.length ? (
        <>
          <SectionHeader
            title="Sold Options"
            subtitle="Options you have sold"
          />
          <CardList>
            {activeSellerCallOptions.map((item) => (
              <CallOptionCard
                key={item.publicKey.toBase58()}
                callOption={item}
              />
            ))}
          </CardList>
        </>
      ) : null}

      {buyerCallOptions.length ? (
        <>
          <SectionHeader
            title="Bought Options"
            subtitle="Options you have bought"
          />
          <CardList>
            {buyerCallOptions.map((item) => (
              <CallOptionCard
                key={item.publicKey.toBase58()}
                callOption={item}
              />
            ))}
          </CardList>
        </>
      ) : null}

      {!buyerCallOptions.length && !sellerCallOptions.length && (
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

const Hires = () => {
  const lenderHiresQuery = useLenderHiresQuery();
  const borrowerHiresQuery = useBorrowerHiresQuery();
  // Deprecated listings
  // const listingsQuery = usePersonalListingsQuery();

  const lenderHires = useMemo(
    () => lenderHiresQuery.data?.map((l) => Hire.fromJSON(l)) || [],
    [lenderHiresQuery.data]
  );

  const listedHires = useMemo(
    () => lenderHires.filter((b) => b.state !== HireStateEnum.Hired),
    [lenderHires]
  );

  const activeHires = useMemo(
    () => lenderHires.filter((b) => b.state === HireStateEnum.Hired),
    [lenderHires]
  );

  const borrowerHires = useMemo(
    () => borrowerHiresQuery.data?.map((l) => Hire.fromJSON(l)) || [],
    [borrowerHiresQuery.data]
  );

  if (lenderHiresQuery.isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {listedHires.length ? (
        <>
          <SectionHeader
            title="Listed items"
            subtitle="Your NFTs listed for rental"
          />
          <CardList>
            {listedHires.map((item) => (
              <HireCard key={item.publicKey.toBase58()} hire={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {activeHires.length ? (
        <>
          <SectionHeader
            title="Active rentals"
            subtitle="NFTs you are actively renting out"
          />
          <CardList>
            {activeHires.map((item) => (
              <HireCard key={item.publicKey.toBase58()} hire={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {borrowerHires.length ? (
        <>
          <SectionHeader
            title="Your rentals"
            subtitle="NFTs you are currently renting"
          />
          <CardList>
            {borrowerHires.map((item) => (
              <HireCard key={item.publicKey.toBase58()} hire={item} />
            ))}
          </CardList>
        </>
      ) : null}

      {!lenderHires.length && !borrowerHires.length && (
        <>
          <SectionHeader title="My Loans" />
          <Box mb="12">
            <Text>
              Why not check out our{" "}
              <NextLink href="/#rentals" scroll={false}>
                <Link color="green.600" fontWeight="semibold">
                  current listings
                </Link>
              </NextLink>{" "}
              to start renting?
            </Text>
          </Box>
        </>
      )}

      {/* {deprecatedListings.length ? (
        <>
          <SectionHeader
            title="Deprecated v1 Listings"
            subtitle="Please close the following accounts"
          />
          <CardList>
            {deprecatedListings.map((item) => (
              <ListingCard key={item.publicKey.toBase58()} listing={item} />
            ))}
          </CardList>
        </>
      ) : null} */}
    </>
  );
};

const MyItems = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [selected, setSelected] = useState<NFTResult | null>(null);
  const [type, setType] = useState<"loan" | "callOption" | "hire" | null>(null);
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

  const renderedCollections = useMemo(() => {
    return collections?.length ? (
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
    );
  }, [collections]);

  if (!nftQuery.isFetched) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {renderedCollections}

      <Modal
        isCentered
        size="xl"
        isOpen={Boolean(selected && type === null)}
        onClose={() => setSelected(null)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="2xl" fontWeight="black">
            Select listing type
          </ModalHeader>
          <ModalBody>
            <Button
              w="100%"
              mb="4"
              colorScheme="green"
              rightIcon={<IoCash />}
              onClick={() => setType("loan")}
            >
              Borrow against
            </Button>
            <Button
              w="100%"
              mb="4"
              colorScheme="teal"
              rightIcon={<IoCalendar />}
              onClick={() => setType("callOption")}
            >
              Sell call option
            </Button>
            <Button
              w="100%"
              mb="4"
              colorScheme="blue"
              rightIcon={<IoBicycle />}
              onClick={() => setType("hire")}
            >
              Rent
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>

      <InitLoanModal
        selected={selected && type === "loan" ? selected : null}
        onRequestClose={() => {
          setSelected(null);
          setType(null);
        }}
      />

      <InitCallOptionModal
        selected={selected && type === "callOption" ? selected : null}
        onRequestClose={() => {
          setSelected(null);
          setType(null);
        }}
      />

      <InitHireModal
        selected={selected && type === "hire" ? selected : null}
        onRequestClose={() => {
          setSelected(null);
          setType(null);
        }}
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
            <Button w="100%" onClick={() => onSelectItem(item)}>
              Select
            </Button>
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
