import type { NextPage } from "next";
import NextLink from "next/link";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Container,
  Heading,
  Flex,
  Link,
  Text,
} from "@chakra-ui/react";
import {
  IoCalendarNumber,
  IoPricetag,
  IoCash,
  IoSwapHorizontal,
  IoTrash,
} from "react-icons/io5";

interface FaqLink {
  href: string;
  children: React.ReactNode;
}

const FAQLink = ({ href, children }: FaqLink) => (
  <NextLink href={href}>
    <Link color="green.500" fontWeight="semibold">
      {children}
    </Link>
  </NextLink>
);

const FAQS = [
  {
    question: "How do I borrow?",
    answer: (
      <>
        <Text mb="2">
          Dexloan works like a marketplace where borrowers create listings which
          lenders can then choose to accept. All loans on Dexloan are secured
          using an NFT as collateral. To start borrowing, select and list one of
          the approved NFTs from the{" "}
          <FAQLink href="/manage">Borrow Tab</FAQLink> on the manage page.
        </Text>
        <Text>
          When creating your listing, you can choose the duration, amount (LTV)
          and interest rate (APY). These are the loan conditions you are
          offering a potential lender. Once the listing is active, you must wait
          for a lender to take up your listing.
        </Text>
      </>
    ),
  },
  {
    question: "How much can I borrow?",
    answer: (
      <>
        <Text mb="2">
          You can borrow upto a maximum of 100% of the current floor price of an
          NFT&lsquo;s collection.
        </Text>
        <Text>
          Because most NFT collections have volatile floor prices, it makes
          sense for loans to be overcollateralized by a reasonable amount to
          reduce the risk for lenders.
        </Text>
      </>
    ),
  },
  {
    question: "How do I lend?",
    answer: (
      <>
        <Text>
          To start lending, simply visit the{" "}
          <FAQLink href="/#listings">Current Listings</FAQLink> section of our
          home page. Select the listing you want to lend against and click the{" "}
          <strong>Lend SOL</strong> button.
        </Text>
      </>
    ),
  },
  {
    question: "What happens to my NFT when I borrow?",
    answer: (
      <>
        <Text>
          When you create a listing, your NFT is transferred to an escrow
          account where it is held as collateral until either the listing is
          cancelled or the loan is completed.
        </Text>
      </>
    ),
  },
  {
    question: "What happens if I fail to repay my loan?",
    answer: (
      <>
        <Text>
          If you fail to repay your loan before the expiry date, the lender may
          exercise the option to repossess your NFT. As long as the lender does
          not repossess the NFT, interest will continue to accrue at the agreed
          APY, and you may repay the loan.
        </Text>
      </>
    ),
  },
  {
    question: "When can I repay my loan?",
    answer: (
      <>
        <Text>
          While the loan is active, you can choose to repay at any time. You
          will be charged interest on a pro-rata basis based on the agreed APY.
        </Text>
      </>
    ),
  },
  {
    question: "When lending pools?",
    answer: (
      <>
        <Text>Soon.</Text>
      </>
    ),
  },
];

const STEPS = [
  {
    icon: IoPricetag,
    text: "Select and list your NFT. You can choose the duration, LTV and interest rate. An on-chain listing will be created and the NFT will be transferred to an escrow account.",
  },
  {
    icon: IoTrash,
    text: "The borrower can cancel the listing and re-list, provided the listing is not yet active.",
  },
  {
    icon: IoCash,
    text: "When a lender decides to lend, the loan is sent directly to the borrower, and the NFT will remain in the escrow. The listing is now active.",
  },
  {
    icon: IoSwapHorizontal,
    text: "The borrower may repay the loan at any time. When repayment is made the total amount - including interest - will be sent directly to the lender, and the NFT will be returned to the borrower.",
  },
  {
    icon: IoCalendarNumber,
    text: "If the borrower fails to repay the loan before the due date, the lender may choose to repossess the NFT. However, the lender may also choose to wait longer for repayment, and interest will continue to accrue.",
  },
];

const FAQ: NextPage = () => {
  return (
    <Container maxW="container.md">
      <Heading
        as="h1"
        size="lg"
        fontWeight="black"
        textAlign="center"
        mt="16"
        mb="12"
      >
        How it works
      </Heading>

      <Box>
        {STEPS.map((step, index) => (
          <Flex key={index} direction="column" align="center">
            <Box
              as={step.icon}
              boxSize="60px"
              padding="12px"
              borderRadius="full"
              borderWidth="1px"
              borderColor="gray.100"
              color="teal.500"
              size="2rem"
              mb="6"
            />
            <Text
              color="gray.700"
              fontSize="1rem"
              textAlign="center"
              maxW="60ch"
              mb="8"
            >
              <Text as="span" color="teal.500" fontWeight="black">
                {index + 1}.&nbsp;&nbsp;
              </Text>
              {step.text}
            </Text>
          </Flex>
        ))}
      </Box>

      <Heading as="h2" size="md" fontWeight="black" textAlign="center" my="16">
        Frequently Asked Questions
      </Heading>

      <Accordion mb="12">
        {FAQS.map(({ question, answer }) => (
          <AccordionItem
            key={question}
            borderWidth="1px"
            borderRadius="lg"
            py="2"
            mb="2"
          >
            <h2>
              <AccordionButton>
                <Box as="h3" flex="1" fontWeight="semibold" textAlign="left">
                  {question}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>{answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
};

export default FAQ;
