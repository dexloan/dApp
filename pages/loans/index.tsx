import type { NextPage } from "next";
import {
  Container,
  Heading,
  Box,
  Skeleton,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import Image from "next/image";

import { Loan } from "../../common/model";
import { LoanStateEnum } from "../../common/types";
import { useLoansQuery, useMetadataFileQuery } from "../../hooks/query";
import { useRouter } from "next/router";

const Loans: NextPage = () => {
  const loansQuery = useLoansQuery();

  const loans = useMemo(
    () =>
      (loansQuery.data?.map(Loan.fromJSON) || [])
        .filter((loan) => loan.state !== LoanStateEnum.Defaulted)
        .sort((loan) => {
          if (loan.state === "listed") return -1;
          return 1;
        }),
    [loansQuery.data]
  );

  return (
    <Container maxW="container.lg">
      <TableContainer maxW="container.lg" width="100%">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Collateral</Th>
              <ColumnHeader>Duration</ColumnHeader>
              <ColumnHeader isNumeric>LTV</ColumnHeader>
              <ColumnHeader isNumeric>Borrow APY</ColumnHeader>
            </Tr>
          </Thead>
          <Tbody>
            {loans.map((loan) => (
              <LoanRow key={loan.publicKey.toBase58()} loan={loan} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

interface ColumnHeaderProps {
  children: string;
  isNumeric?: boolean;
}

const ColumnHeader = ({ children, isNumeric }: ColumnHeaderProps) => {
  return (
    <Th>
      <Box
        display="flex"
        alignItems="center"
        justifyContent={isNumeric ? "flex-end" : "flex-start"}
      >
        <Box textAlign={isNumeric ? "right" : undefined}>{children}</Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          ml="2"
        >
          <Box as="span" position="relative" top="2px">
            <IoCaretUp />
          </Box>
          <Box as="span" position="relative" bottom="2px">
            <IoCaretDown />
          </Box>
        </Box>
      </Box>
    </Th>
  );
};

interface LoanRowProps {
  loan: Loan;
}

const LoanRow = ({ loan }: LoanRowProps) => {
  const router = useRouter();
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataFileQuery(loan.metadata.data.uri);

  return (
    <Tr
      key={loan.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => router.push(`/loans/${loan.publicKey.toBase58()}`)}
    >
      <Td>
        <Box display="flex" alignItems="center">
          <Box
            as="span"
            display="block"
            position="relative"
            width="12"
            height="12"
            borderRadius="sm"
            overflow="hidden"
          >
            <Box
              as="span"
              position="absolute"
              left="0"
              top="0"
              right="0"
              bottom="0"
            >
              <Skeleton
                height="100%"
                width="100%"
                isLoaded={metadataQuery.data?.image && isVisible}
              >
                {metadataQuery.data?.image && (
                  <Image
                    quality={100}
                    layout="fill"
                    objectFit="cover"
                    src={metadataQuery.data?.image}
                    alt={loan.metadata.data.name}
                    onLoad={() => setVisible(true)}
                  />
                )}
              </Skeleton>
            </Box>
          </Box>
          <Text ml="4">{loan.metadata.data.name}</Text>
        </Box>
      </Td>
      <Td>{loan.duration}</Td>
      <Td isNumeric>50%</Td>
      <Td isNumeric>{loan.apy}</Td>
    </Tr>
  );
};

export default Loans;
