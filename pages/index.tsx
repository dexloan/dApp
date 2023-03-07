import type { NextPage } from "next";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Container,
  Heading,
  Icon,
  LinkOverlay,
  Text,
} from "@chakra-ui/react";
import {
  IoPeopleOutline,
  IoCashOutline,
  IoLockOpenOutline,
  IoLogoDiscord,
  IoLogoTwitter,
} from "react-icons/io5";
import Image from "next/image";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <>
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
                communities. Borrow and lend. Buy and sell call options. Rent
                and stake.
              </Text>
              <ButtonGroup>
                <Button>Borrow &amp; Lend</Button>
                <Button>Trade Options</Button>
              </ButtonGroup>
            </Box>
          </Box>
        </Container>
      </Box>
      <Container
        maxW="container.lg"
        borderBottom="1px"
        borderColor="whiteAlpha.50"
      >
        <Box display="flex" py="40" gap="12">
          <Box flex={1}>
            <Box
              p="6"
              borderWidth="1px"
              borderColor="gray.800"
              borderRadius="md"
            >
              <Icon boxSize="2em" as={IoPeopleOutline} />
              <Heading mt="2" fontSize="md">
                Community driven
              </Heading>
              <Badge my="2">Coming soon</Badge>
              <Text mt="4">
                Onda is a decentralized marketplace where creators and NFT
                holders decide on the fees that work best for their community.
              </Text>
            </Box>
          </Box>
          <Box flex={1}>
            <Box
              p="6"
              borderWidth="1px"
              borderColor="gray.800"
              borderRadius="md"
            >
              <Icon boxSize="2em" as={IoCashOutline} />
              <Heading mt="2" fontSize="md">
                Alternative income streams
              </Heading>
              <Badge my="2">Alpha now live</Badge>
              <Text mt="4">
                Financialization of NFTs creates new opportunities and income
                streams for NFT projects. Borrow, lend and trade as a community.
              </Text>
            </Box>
          </Box>
          <Box flex={1}>
            <Box
              p="6"
              borderWidth="1px"
              borderColor="gray.800"
              borderRadius="md"
            >
              <Icon boxSize="2em" as={IoLockOpenOutline} />
              <Heading mt="2" fontSize="md">
                Open source
              </Heading>
              <Badge my="2">Coming soon</Badge>
              <Text mt="4">
                A fully open soruce protocol that anyone can contribute to.
                Build your own community marketplace and take part in a global
                liquidty layer.
              </Text>
            </Box>
          </Box>
        </Box>
      </Container>
      <Box position="absolute" bottom="0" left="0" right="0" bgColor="onda.950">
        <Container maxW="container.xl">
          <Box display="flex" py="12" gap="6" justifyContent="flex-end">
            <Box position="relative" display="flex" alignItems="center">
              <Icon as={IoLogoDiscord} boxSize="2em" mr="2" />
              <LinkOverlay href="https://discord.gg/WJVYcHHGHr" isExternal>
                Discord
              </LinkOverlay>
            </Box>
            <Box position="relative" display="flex" alignItems="center">
              <Icon as={IoLogoTwitter} boxSize="2em" mr="2" />
              <LinkOverlay href="https://twitter.com/OndaProtocol" isExternal>
                Twitter
              </LinkOverlay>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Home;
