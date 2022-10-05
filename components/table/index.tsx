import { Box, Th, Icon } from "@chakra-ui/react";
import { IoCaretDown, IoCaretUp } from "react-icons/io5";

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
