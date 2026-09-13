import { type ReactNode } from 'react';

function ArticleSection({ children }: { readonly children: ReactNode }) {
  return <section className="grid gap-6">{children}</section>;
}

export { ArticleSection };
