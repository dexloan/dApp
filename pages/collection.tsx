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
import { Controller, useForm } from "react-hook-form";

import { useCollectionsQuery } from "../hooks/query";
import {
  useInitCollectionMutation,
  useCloseCollectionMutation,
} from "../hooks/mutation";
import { Card, CardList } from "../components/card";

const Collection: NextPage = () => {
  const collectionsQuery = useCollectionsQuery();
  const initMutation = useInitCollectionMutation();
  const closeMutation = useCloseCollectionMutation();

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
        {collectionsQuery.data?.map((collection) => (
          <Card
            key={collection.publicKey}
            uri={collection.metadata.data.uri}
            imageAlt={collection.metadata.data.name}
          >
            <Box p="4">
              <Box
                mt="1"
                fontWeight="semibold"
                as="h4"
                lineHeight="tight"
                isTruncated
              >
                {collection.metadata.data.name}
              </Box>
              <Button
                isLoading={closeMutation.isLoading}
                onClick={() =>
                  closeMutation.mutate({
                    mint: new anchor.web3.PublicKey(collection.data.mint),
                  })
                }
              >
                Close
              </Button>
            </Box>
          </Card>
        ))}
      </CardList>
      <Box pb="4" pt="6" pl="6" pr="6" bg="gray.50" borderRadius="md">
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
            <Button
              colorScheme="green"
              type="submit"
              w="100%"
              isLoading={initMutation.isLoading}
            >
              Confirm
            </Button>
          </FormControl>
        </form>
      </Box>
    </Container>
  );
};

export default Collection;
