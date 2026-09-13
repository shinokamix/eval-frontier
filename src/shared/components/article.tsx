import { type ReactNode } from 'react';

function Article({ children }: { readonly children: ReactNode }) {
  return (
    <article className="page-gutter py-16 md:py-20">
      <div className="mx-auto grid max-w-3xl gap-16 md:gap-20">{children}</div>
    </article>
  );
}

export { Article };
