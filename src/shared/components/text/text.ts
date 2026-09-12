import { cn } from 'cn';
import { createElement, type ElementType, type ReactNode } from 'react';

const textVariants = {
  title: {
    className:
      'font-sans text-[clamp(2.75rem,7vw,6.5rem)] font-semibold leading-[0.94] tracking-[-0.055em]',
    tag: 'h1',
  },
  heading: {
    className:
      'font-sans text-[clamp(1.75rem,3vw,2.75rem)] font-semibold leading-[1.02] tracking-[-0.035em]',
    tag: 'h2',
  },
  body: {
    className: 'font-sans text-base font-normal leading-[1.55]',
    tag: 'p',
  },
  inline: {
    className: 'font-sans text-base font-normal leading-[1.55]',
    tag: 'span',
  },
  value: {
    className:
      'font-mono text-base font-normal tabular-nums [font-variant-ligatures:none]',
    tag: 'span',
  },
} as const;

type TextVariant = keyof typeof textVariants;

interface TextProps {
  readonly as?: ElementType;
  readonly variant?: TextVariant;
  readonly className?: string;
  readonly children?: ReactNode;
  readonly id?: string;
  readonly title?: string;
}

function Text({
  as,
  variant = 'body',
  className,
  children,
  id,
  title,
}: TextProps) {
  const config = textVariants[variant];

  return createElement(
    as ?? config.tag,
    { className: cn(config.className, className), id, title },
    children,
  );
}

export type { TextProps, TextVariant };
export { Text };
