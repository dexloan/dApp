import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Heading: {
      color: "gray.700",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        color: "gray.600",
      },
    }),
  },
});

export default theme;
