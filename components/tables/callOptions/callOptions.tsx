import * as anchor from "@project-serum/anchor";
import { Text, Tr, Th, Td, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { useRouter } from "next/router";

import {
  CallOption,
  CallOptionPretty,
  CallOptionBid,
} from "../../../common/model";
import { useFloorPriceQuery } from "../../../hooks/query";
import {
  ColumnHeader,
  NFTCell,
  ListingsTable,
  Col,
} from "../../../components/table";
import {
  CallOptionSortCols,
  useCallOptionSortState,
  useSortedCallOptions,
} from "./common";
import { FloorPrice } from "../../floorPrice";

export const CALL_OPTION_COLS: Readonly<Col<CallOptionSortCols>[]> = [
  { name: "asset", label: "Asset" },
  { name: "expiry", label: "Expiry" },
  { name: "cost", label: "Cost", isNumeric: true },
  { name: "strikePrice", label: "Strike Price", isNumeric: true },
] as const;

interface CallOptionListingsProps {
  heading: string;
  placeholderMessage: string;
  action?: React.ReactNode;
  callOptions?: CallOptionPretty[];
  isLoading: boolean;
}

export const CallOptionListings = ({
  heading,
  placeholderMessage,
  action = null,
  callOptions,
  isLoading,
}: CallOptionListingsProps) => {
  const router = useRouter();
  const [sortState, onSort] = useCallOptionSortState();
  const sortedOptions = useSortedCallOptions(callOptions, sortState);

  return (
    <ListingsTable<CallOptionSortCols, CallOption>
      heading={heading}
      placeholder={placeholderMessage}
      action={action}
      cols={CALL_OPTION_COLS}
      items={sortedOptions}
      isLoading={isLoading}
      renderCol={(col) => {
        if (col.name === "asset") {
          return <Th key={col.name}>{col.label}</Th>;
        }

        return (
          <ColumnHeader
            key={col.name}
            isNumeric={col.isNumeric}
            direction={sortState[0] === col.name ? sortState[1] : 0}
            onClick={() => onSort(col.name)}
          >
            {col.label}
          </ColumnHeader>
        );
      }}
      renderRow={(item) => (
        <OptionRow
          key={item.address}
          option={item}
          onClick={() => router.push(`/options/${item.address}`)}
        />
      )}
    />
  );
};

interface OptionRowProps {
  option: CallOption | CallOptionBid;
  onClick: () => void;
}

export const OptionRow = ({ option, onClick }: OptionRowProps) => {
  const floorPriceQuery = useFloorPriceQuery(option?.metadata.data.symbol);

  const floorPriceSol = useMemo(() => {
    if (floorPriceQuery.data?.floorPrice) {
      return floorPriceQuery.data?.floorPrice / anchor.web3.LAMPORTS_PER_SOL;
    }
  }, [floorPriceQuery.data]);

  return (
    <Tr
      key={option.publicKey.toBase58()}
      cursor="pointer"
      _hover={{ bg: "rgba(255, 255, 255, 0.02)" }}
      onClick={onClick}
    >
      <NFTCell metadata={option?.metadata} />
      <Td>{option.expiry}</Td>
      <Td isNumeric>{option.cost}</Td>
      <Td isNumeric>
        <Text mb="1">{option.strikePrice}</Text>
        <FloorPrice>{floorPriceSol}</FloorPrice>
      </Td>
    </Tr>
  );
};
