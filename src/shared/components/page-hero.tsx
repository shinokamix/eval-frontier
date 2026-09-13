import { type ReactNode } from 'react';

import { Text } from '@/shared/components/text';

interface PageHeroProps {
  readonly image: string;
  readonly alt: string;
  readonly imagePosition?: string;
  readonly label: string;
  readonly title: ReactNode;
}

function PageHero({
  image,
  alt,
  imagePosition = 'center',
  label,
  title,
}: PageHeroProps) {
  return (
    <section className="relative flex min-h-svh items-end overflow-hidden">
      <img
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover grayscale"
        fetchPriority="high"
        src={image}
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-[#090909] via-black/20 to-black/50" />
      <div className="page-gutter relative grid w-full gap-6 pb-12 pt-36 md:pb-16">
        <Text variant="value">{label}</Text>
        <div className="max-w-5xl">
          <Text
            variant="title"
            size="hero"
          >
            {title}
          </Text>
        </div>
      </div>
    </section>
  );
}

export { PageHero };
