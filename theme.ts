import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  components: {
    Tag: {
      parts: ["container"],
      baseStyle: {
        container: {
          borderRadius: "sm",
        },
      },
    },
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
    Table: {
      // parts: ["th", "td"],
      baseStyle: {
        th: {
          color: "gray.200",
        },
        td: {
          color: "gray.200",
          borderBottom: "none",
          py: "1",
          px: "4",
        },
        tbody: {
          tr: {
            "&:nth-of-type(odd)": {
              "th, td": {
                borderBottomWidth: "0px",
              },
            },
            "&:last-of-type": {
              td: {
                borderColor: "gray.900",
              },
            },
          },
        },
        thead: {
          tr: {
            th: {
              py: "4",
              textTransform: "none",
              fontWeight: "medium",
            },
          },
        },
      },
      variants: {
        simple: {
          th: {
            borderBottom: "none",
          },
          td: {
            pb: "4",
          },
        },
      },
      sizes: {
        sm: {
          th: {
            px: "1",
          },
          td: {
            px: "1",
          },
        },
      },
    },
  },
  colors: {
    onda: {
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
      950: "#050510",
    },
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  styles: {
    global: () => ({
      html: {
        minHeight: "100%",
        display: "flex",
      },
      body: {
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        bg: "#090A20",
        flex: 1,
      },
    }),
  },
});

export default theme;
