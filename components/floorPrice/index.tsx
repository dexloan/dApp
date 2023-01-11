import Image from "next/image";
import { Flex, Text } from "@chakra-ui/react";

import { EllipsisProgress } from "../progress";

export const FloorPrice = ({
  children = null,
}: {
  children?: string | null;
}) => {
  return (
    <Flex alignItems="center" justifyContent="flex-end">
      {children ? (
        <>
          <Text fontSize="xs" color="gray.500" mr="1">
            (Floor {children ?? "..."}{" "}
          </Text>
          <Image src="/me.svg" height={16} width={16} alt="Magic Eden" />
          <Text fontSize="xs" color="gray.500">
            )
          </Text>
        </>
      ) : (
        <EllipsisProgress />
      )}
    </Flex>
  );
};
