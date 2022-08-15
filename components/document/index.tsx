import Head from "next/head";
import { Fragment } from "react";

interface DocumentHead {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  url: string;
  twitterLabels: { label: string; value: string }[];
}

export const DocumentHead = ({
  title,
  description,
  image,
  imageAlt,
  url,
  twitterLabels = [],
}: DocumentHead) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="author" content="Dexloan" />
      <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico"></link>
      <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />

      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={`https://dexloan.io/${url}`} />
      <meta property="og:image" content={image} />

      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:url" content={`https://dexloan.io/${url}}`} />
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={imageAlt} />
      {twitterLabels.map(({ label, value }, index) => (
        <Fragment key={label}>
          <meta property={`twitter:label${index + 1}`} content={label} />
          <meta property={`twitter:data${index + 1}`} content={value} />
        </Fragment>
      ))}
    </Head>
  );
};
