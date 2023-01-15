import { Box } from "@chakra-ui/react";

export const Well = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box p="4" borderColor="gray.200" borderWidth={1} borderRadius="md">
      {children}
    </Box>
  );
};
