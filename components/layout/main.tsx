import { Container } from "@chakra-ui/react";

export const Main = ({ children }: { children: React.ReactNode }) => {
  return <Container maxW="container.xl">{children}</Container>;
};
