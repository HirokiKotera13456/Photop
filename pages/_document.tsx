import {
  Html,
  Head,
  Main,
  NextScript,
  DocumentProps,
} from 'next/document';

export default function Document(props: DocumentProps) {
  return (
    <Html lang="ja">
      <Head>
        <meta name="theme-color" content="#E91E63" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
