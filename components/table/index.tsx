import {
  Box,
  Heading,
  Icon,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tooltip,
  Tr,
  Th,
  Td,
  Text,
  Skeleton,
  Spinner,
} from "@chakra-ui/react";
import React, { useState, useMemo } from "react";
import { IoCaretDown, IoCaretUp, IoInformationCircle } from "react-icons/io5";
import Image from "next/image";

import { CollectionJson, SortDirection } from "../../common/types";
import { useMetadataFileQuery, useMetadataQuery } from "../../hooks/query";

interface ColumnHeaderProps {
  children: React.ReactNode;
  direction?: SortDirection;
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
    <Th /* w={{ md: "160px" }} */>
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
            color={direction === "desc" ? "orange.300" : undefined}
          />
          <Icon
            as={IoCaretDown}
            position="relative"
            bottom="2px"
            color={direction === "asc" ? "orange.300" : undefined}
          />
        </Box>
      </Box>
    </Th>
  );
};

export const LTVHeader = () => {
  return (
    <Tooltip label="Amount relative to current floor price">
      <Box display="flex" alignItems="center" justifyContent="flex-end">
        LTV
      </Box>
    </Tooltip>
  );
};

interface NFTCellProps {
  subtitle?: React.ReactNode;
  mint?: string;
  collection?: CollectionJson;
}

export const NFTCellNew = ({ collection, subtitle, mint }: NFTCellProps) => {
  const [isVisible, setVisible] = useState(false);
  const metadataQuery = useMetadataQuery(mint);
  const metadataJsonQuery = useMetadataFileQuery(metadataQuery.data?.data.uri);

  return (
    <Td>
      <Box display="flex" alignItems="center">
        <Box
          as="span"
          display="block"
          position="relative"
          width="12"
          height="12"
          minWidth="12"
          minHeight="12"
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
              isLoaded={metadataJsonQuery.data?.image && isVisible}
            >
              {metadataJsonQuery.data?.image && (
                <Image
                  quality={100}
                  layout="fill"
                  objectFit="cover"
                  src={metadataJsonQuery.data.image}
                  alt={metadataQuery.data?.data.name}
                  onLoad={() => setVisible(true)}
                />
              )}
            </Skeleton>
          </Box>
        </Box>
        <Box ml="4">
          <Text mb="1">{metadataQuery.data?.data.name}</Text>
          <Text fontSize="xs" color="gray.500">
            {subtitle ?? collection?.name ?? null}
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
      <Text fontSize="xs" textAlign="center" maxW="22ch">
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
  action?: React.ReactNode;
  heading: React.ReactNode;
  placeholder: string;
  cols: Readonly<Col<SortCols>[]>;
  items?: ItemType[];
  isLoading?: boolean;
  renderCol: (col: Col<SortCols>, index: number) => React.ReactNode;
  renderRow: (item: ItemType) => React.ReactNode;
}

export const ListingsTable = <SortCols, ItemType>({
  action = null,
  heading,
  placeholder,
  cols,
  items,
  isLoading,
  renderCol,
  renderRow,
}: ListingsTableProps<SortCols, ItemType>) => {
  const renderedCols = useMemo(() => cols.map(renderCol), [cols, renderCol]);
  const renderedRows = useMemo(() => items?.map(renderRow), [items, renderRow]);

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
      <>
        <TableContainer
          maxW="100%"
          mt="2"
          mb="6"
          borderTop="1px"
          borderColor="gray.800"
          width="100%"
        >
          <Table size="sm" sx={{ tableLayout: "fixed" }}>
            <Thead>
              <Tr>{renderedCols}</Tr>
            </Thead>
            <Tbody>{renderedRows}</Tbody>
          </Table>
        </TableContainer>
        {isLoading && (
          <Box display="flex" w="100%" justifyContent="center">
            <Spinner size="sm" />
          </Box>
        )}
        {!isLoading && !items?.length && (
          <EmptyMessage>{placeholder}</EmptyMessage>
        )}
      </>
    </>
  );
};
