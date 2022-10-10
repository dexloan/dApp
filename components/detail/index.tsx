import { Box, Text } from "@chakra-ui/react";

interface DetailProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "sm";
}

export const Detail = ({ children, footer, size = "md" }: DetailProps) => {
  return (
    <Box
      borderRadius="sm"
      bgColor="rgba(0,0,0,0.2)"
      border="1px"
      borderColor="gray.800"
      maxW="100%"
      p={size === "sm" ? "4" : "6"}
    >
      <Text fontSize="sm">{children}</Text>
      {footer}
    </Box>
  );
};
