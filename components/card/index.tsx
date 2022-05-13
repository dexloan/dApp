import * as anchor from "@project-serum/anchor";
import { Box, Image, Skeleton } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useMetadataFileQuery } from "../../hooks/query";

interface CardProps {
  children: React.ReactNode;
  publicKey: anchor.web3.PublicKey;
  uri: string;
  imageAlt: string;
}

export function Card({ children, publicKey, uri, imageAlt }: CardProps) {
  const [isVisible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement & HTMLAnchorElement>(null);

  const metadataQuery = useMetadataFileQuery(uri);

  useEffect(() => {
    function callback([entry]: IntersectionObserverEntry[]) {
      if (entry.isIntersecting) {
        setVisible(true);
      }
    }

    const el = containerRef.current;
    const observer = new IntersectionObserver(callback, {
      root: null,
      rootMargin: "0px",
      threshold: 0.75,
    });

    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  return (
    <Link href={`/listing/${publicKey.toBase58()}`}>
      <Box
        as="a"
        maxW="sm"
        borderWidth="1px"
        borderRadius="lg"
        cursor="pointer"
        overflow="hidden"
        ref={containerRef}
        _focus={{
          boxShadow: "md",
        }}
        _hover={{
          boxShadow: "md",
        }}
        transition="box-shadow 0.2s ease-in-out"
      >
        <Skeleton isLoaded={metadataQuery.data?.image && isVisible}>
          <Image
            boxSize="250px"
            objectFit="cover"
            src={metadataQuery.data?.image}
            alt={imageAlt}
          />
        </Skeleton>

        <Box p="6">{children}</Box>
      </Box>
    </Link>
  );
}
