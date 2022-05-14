import { Box, Container } from "@chakra-ui/react";

export function Main({ children }: { children: React.ReactNode }) {
  return <Container maxW="container.xl">{children}</Container>;
}

export function Well({ children }: { children: React.ReactNode }) {
  return (
    <Box p="4" borderColor="gray.200" borderWidth={1} borderRadius="md">
      {children}
    </Box>
  );
}
