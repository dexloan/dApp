import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  Box,
  Heading,
  Icon,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Skeleton,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import { IoCaretDown, IoCaretUp } from "react-icons/io5";
import Image from "next/image";

import * as utils from "../../common/utils";
import { useMetadataFileQuery } from "../../hooks/query";

interface ColumnHeaderProps {
  children: string;
  direction?: number;
  isNumeric?: boolean;
  onClick: () => void;
}

export const ColumnHeader = ({
  children,
  isNumeric,
  direction,
  onClick,
}: ColumnHeaderProps) => {
  return (
    <Th>
      <Box
        display="flex"
        alignItems="center"
        cursor="pointer"
        justifyContent={isNumeric ? "flex-end" : "flex-start"}
        onClick={onClick}
      >
        <Box textAlign={isNumeric ? "right" : undefined}>{children}</Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          ml="2"
        >
          <Icon
            as={IoCaretUp}
            position="relative"
            top="2px"
            color={direction === 1 ? "orange.300" : undefined}
          />
          <Icon
            as={IoCaretDown}
            position="relative"
            bottom="2px"
            color={direction === -1 ? "orange.300" : undefined}
          />
        </Box>
      </Box>
    </Th>
  );
};

interface NFTCellProps {
  metadata?: Metadata;
}

export const NFTCell = ({ metadata }: NFTCellProps) => {
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataFileQuery(metadata?.data.uri);

  const collection = useMemo(() => {
    if (metadata?.data.symbol) {
      return utils.mapSymbolToCollectionTitle(metadata.data.symbol);
    }
    return null;
  }, [metadata?.data.symbol]);

  return (
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
                  alt={metadata?.data.name}
                  onLoad={() => setVisible(true)}
                />
              )}
            </Skeleton>
          </Box>
        </Box>
        <Box ml="4">
          <Text mb="1">{metadata?.data.name}</Text>
          <Text fontSize="xs" color="gray.500">
            {collection}
          </Text>
        </Box>
      </Box>
    </Td>
  );
};

interface EmptyMessageProps {
  children: string;
}

export const EmptyMessage = ({
  children = "No listings currently",
}: EmptyMessageProps) => {
  return (
    <Box w="100%" p="6" mb="6" display="flex" justifyContent="center">
      <Text fontSize="xs" maxW="22ch">
        {children}
      </Text>
    </Box>
  );
};

export interface Col<SortColsTuple> {
  isNumeric?: boolean;
  label: string;
  name: SortColsTuple;
}

interface ListingsTableProps<SortCols, ItemType> {
  action: React.ReactNode;
  heading: React.ReactNode;
  placeholder: string;
  cols: Readonly<Col<SortCols>[]>;
  items: ItemType[];
  renderCol: (col: Col<SortCols>, index: number) => React.ReactNode;
  renderRow: (item: ItemType) => React.ReactNode;
}

export const ListingsTable = <SortCols, ItemType>({
  action,
  heading,
  placeholder,
  cols,
  items,
  renderCol,
  renderRow,
}: ListingsTableProps<SortCols, ItemType>) => {
  const renderedCols = useMemo(() => cols.map(renderCol), [cols, renderCol]);
  const renderedRows = useMemo(() => items.map(renderRow), [items, renderRow]);

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb="2"
      >
        <Heading as="h3" color="gray.200" size="sm">
          {heading}
        </Heading>
        {action}
      </Box>
      {items.length ? (
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
              <Tr>{renderedCols}</Tr>
            </Thead>
            <Tbody>{renderedRows}</Tbody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyMessage>{placeholder}</EmptyMessage>
      )}
    </>
  );
};
