import {
  Container,
  Heading,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

import { CallOption, CallOptionBid } from "../../../common/model";
import { ColumnHeader, NFTCell } from "../../../components/table";
import { CallOptionSortCols, CallOptionSortFn } from "./common";

interface CallOptionListingsProps {
  heading: string;
  placeholderMessage: string;
  action?: React.ReactNode;
  callOptions: CallOption[] | CallOptionBid[];
  direction: number;
  sortCol: CallOptionSortCols;
  onSort: CallOptionSortFn;
}

export const CallOptionListings = ({
  heading,
  placeholderMessage,
  action = null,
  callOptions,
  sortCol,
  direction,
  onSort,
}: CallOptionListingsProps) => {
  return (
    <TableContainer
      maxW="100%"
      mt="2"
      mb="6"
      borderTop="1px"
      borderColor="gray.800"
      width="100%"
    >
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Asset</Th>
            <ColumnHeader
              direction={sortCol === "expiry" ? direction : 0}
              onClick={() => onSort("expiry")}
            >
              Expiry
            </ColumnHeader>
            <ColumnHeader
              isNumeric
              direction={sortCol === "strikePrice" ? direction : 0}
              onClick={() => onSort("strikePrice")}
            >
              Strike Price
            </ColumnHeader>
            <ColumnHeader
              isNumeric
              direction={sortCol === "cost" ? direction : 0}
              onClick={() => onSort("cost")}
            >
              Cost
            </ColumnHeader>
          </Tr>
        </Thead>
        <Tbody>
          {callOptions.map((option) => (
            <OptionRow key={option.publicKey.toBase58()} option={option} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

interface OptionRowProps {
  option: CallOption | CallOptionBid;
}

export const OptionRow = ({ option }: OptionRowProps) => {
  const router = useRouter();

  return (
    <Tr
      key={option.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={() => router.push(`/options/${option.publicKey.toBase58()}`)}
    >
      <NFTCell metadata={option?.metadata} />
      <Td>{option.expiry}</Td>
      <Td isNumeric>{option.strikePrice}</Td>
      <Td isNumeric>{option.cost}</Td>
    </Tr>
  );
};
