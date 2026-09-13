import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

type ArticleRoute = '/evidence' | '/explore' | '/methodology';

interface ArticleLinkProps {
  readonly children: string;
  readonly to: ArticleRoute;
}

function ArticleLink(props: Readonly<ArticleLinkProps>) {
  return (
    <Link
      className="inline-block border-b border-white/50 pb-1"
      to={props.to}
    >
      <Text variant="inline">{props.children}</Text>
    </Link>
  );
}

export { ArticleLink };
