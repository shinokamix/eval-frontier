import { cn } from 'cn';

import { Text, type TextProps } from '@/shared/components/text';

interface UnderlinedLabelProps {
  readonly active: boolean;
  readonly children: string;
  readonly size?: TextProps['size'];
}

function UnderlinedLabel({ active, children, size }: UnderlinedLabelProps) {
  const lineClassName = cn(
    'absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-300 ease-out motion-reduce:transition-none',
    active
      ? 'scale-x-100'
      : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100',
  );

  return (
    <span className="relative inline-flex whitespace-nowrap pb-1">
      <Text
        variant="inline"
        size={size}
      >
        {children}
      </Text>
      <span
        aria-hidden="true"
        className={lineClassName}
      />
    </span>
  );
}

export { UnderlinedLabel };
