import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

type ArticleRoute = '/evidence' | '/explore' | '/methodology';

type ArticleLinkProps = { readonly children: string } & (
  | { readonly to: ArticleRoute; readonly href?: never }
  | { readonly href: string; readonly to?: never }
);

function ArticleLink(props: Readonly<ArticleLinkProps>) {
  const external = props.href !== undefined;

  return (
    <Link
      className="inline-block border-b border-white/50 pb-1"
      rel={external ? 'noreferrer' : undefined}
      target={external ? '_blank' : undefined}
      to={props.href ?? props.to}
    >
      <Text variant="inline">{props.children}</Text>
    </Link>
  );
}

export { ArticleLink };
