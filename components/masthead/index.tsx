import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  Heading,
  Text,
} from "@chakra-ui/react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import Image from "next/image";

export function Masthead() {
  return (
    <Box position="relative" borderBottom="1px" borderColor="whiteAlpha.50">
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        flex={1}
      >
        <Box opacity={0.05}>
          <Image
            src="/waves.jpeg"
            layout="fill"
            objectFit="cover"
            objectPosition="top"
            style={{
              userSelect: "none",
            }}
            alt="waves"
          />
        </Box>
      </Box>

      <Container maxW="container.xl">
        <Box display="flex" py="40">
          <Box position="relative" flex={1}>
            <Box pb="20">
              <Heading
                as="h1"
                size="2xl"
                lineHeight="normal"
                fontWeight="medium"
                maxW="16ch"
                mb="4"
              >
                The financial layer for NFT communities
              </Heading>
              <Badge> Alpha now live</Badge>
            </Box>
            <Text
              fontSize="lg"
              fontWeight="normal"
              color="gray.300"
              mb="8"
              maxW="50ch"
            >
              Onda is a decentralized liqudity layer that gives control to
              communities. Borrow and lend. Buy and sell call options. Rent and
              stake.
            </Text>
            <ButtonGroup>
              <Button>Borrow &amp; Lend</Button>
              <Button>Trade Options</Button>
            </ButtonGroup>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
