import * as anchor from "@project-serum/anchor";
import type { NextPage } from "next";
import {
  Box,
  Button,
  Container,
  Heading,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
} from "@chakra-ui/react";
import { useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useMetadataQuery } from "../hooks/query";
import {
  useInitCollectionMutation,
  useCloseCollectionMutation,
} from "../hooks/mutation";
import { Card, CardList } from "../components/card";
import { fetchMultipleCollections } from "../common/query";

const Collection: NextPage = () => {
  // const collectionsQuery = useCollectionsQuery();
  const { connection } = useConnection();
  const [collections, setCollections] = useState<any[]>([]);
  const initMutation = useInitCollectionMutation();
  const closeMutation = useCloseCollectionMutation();

  useEffect(() => {
    fetchMultipleCollections(connection).then((collections) => {
      setCollections(collections);
    });
  }, [connection]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<{
    mint: string;
  }>({
    defaultValues: {
      mint: undefined,
    },
  });

  return (
    <Container maxW="container.xl">
      <Heading id="#listings" as="h3" color="gray.600" size="sm" mb="4">
        Collections
      </Heading>
      <CardList>
        {collections.map((collection) => (
          <CollectionCard
            key={collection.publicKey}
            collection={collection.data}
            isLoading={closeMutation.isLoading}
            onClose={() => {
              closeMutation.mutate({
                mint: new anchor.web3.PublicKey(collection.data.mint),
              });
            }}
          />
        ))}
      </CardList>
      <Box pb="4" pt="6" pl="6" pr="6" borderRadius="md">
        <form
          onSubmit={handleSubmit((data) => {
            initMutation.mutate({ mint: new anchor.web3.PublicKey(data.mint) });
          })}
        >
          <FormControl isInvalid={!isValid}>
            <Box pb="6">
              <Controller
                name="mint"
                control={control}
                rules={{
                  required: true,
                }}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <FormControl isInvalid={Boolean(error)}>
                    <FormLabel htmlFor="mint">Mint</FormLabel>
                    <Input
                      name="mint"
                      placeholder="Collection Mint"
                      value={value}
                      onChange={onChange}
                    />
                    <FormHelperText>The collection mint address</FormHelperText>
                  </FormControl>
                )}
              />
            </Box>
            <Button type="submit" w="100%" isLoading={initMutation.isLoading}>
              Confirm
            </Button>
          </FormControl>
        </form>
      </Box>
    </Container>
  );
};

interface CollectionCardProps {
  collection: any;
  isLoading: boolean;
  onClose: () => void;
}

const CollectionCard = ({
  collection,
  isLoading,
  onClose,
}: CollectionCardProps) => {
  const metadataQuery = useMetadataQuery(collection.mint);

  return (
    <Card
      key={collection.address}
      uri={metadataQuery.data?.data.uri as string}
      imageAlt={metadataQuery.data?.data.name as string}
    >
      <Box p="4">
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {collection.address}
        </Box>
        <Button isLoading={isLoading} onClick={onClose}>
          Close
        </Button>
      </Box>
    </Card>
  );
};

export default Collection;
