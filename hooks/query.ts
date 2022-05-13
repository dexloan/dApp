import { useQuery } from "react-query";

export function useMetadataFileQuery(uri?: string) {
  return useQuery(
    ["metadataFile", uri],
    () => {
      if (uri) {
        return fetch(uri).then((response) => {
          return response.json().then((data) => data);
        });
      }
    },
    {
      enabled: Boolean(uri),
      refetchOnWindowFocus: false,
    }
  );
}
