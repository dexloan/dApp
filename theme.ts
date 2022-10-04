import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        borderRadius: "sm",
      },
      variants: {
        ghost: {
          borderRadius: "xl",
          color: "gray.400",
          _hover: {
            bg: "transparent",
            color: "gray.100",
          },
          _active: {
            bg: "transparent",
            color: "gray.50",
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        color: "gray.100",
      },
    },
    Text: {
      baseStyle: {
        color: "gray.100",
      },
    },
  },
  colors: {
    // #EA858D
    // #AA586F
    // #502C48
    // #2F4D8B
    // #033B6E
    // #0C0D29
    blue: {
      50: "#CCCDF0",
      100: "#999CE1",
      200: "#4D51CB",
      300: "#383CC0",
      400: "#3034A7",
      500: "#292C8D",
      600: "#222474",
      700: "#1A1C5A",
      800: "#131441",
      900: "#0C0D29",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: () => ({
      body: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        bg: "blue.900",
      },
    }),
  },
});

export default theme;
