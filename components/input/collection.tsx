import { Checkbox, CheckboxGroup } from "@chakra-ui/react";
import { useCollectionsQuery } from "../../hooks/query";

interface CollectionFilter {
  onChange: (collections?: string[]) => void;
}

export const CollectionFilter = ({ onChange }: CollectionFilter) => {
  const query = useCollectionsQuery();

  return (
    <CheckboxGroup onChange={(value) => onChange(value as string[])}>
      {query.data?.map((collection) => (
        <Checkbox
          key={collection.address}
          value={collection.address}
          my="2"
          width="100%"
        >
          {collection.name}
        </Checkbox>
      ))}
    </CheckboxGroup>
  );
};
