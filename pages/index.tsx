import type { NextPage } from "next";
import { Container } from "@chakra-ui/react";
import { Masthead } from "../components/masthead";

const Home: NextPage = () => {
  return (
    <>
      <Container maxW="container.lg">
        <Masthead />
      </Container>
    </>
  );
};

export default Home;
