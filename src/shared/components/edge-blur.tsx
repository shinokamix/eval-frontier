import { cn } from 'cn';

interface EdgeBlurProps {
  readonly edge: 'top' | 'bottom';
}

const layers = [
  cn(
    'backdrop-blur-[2px]',
    '[mask-image:linear-gradient(var(--edge-direction),black_35%,#000d_55%,#0008_75%,#0002_90%,transparent_100%)]',
  ),
  cn(
    'backdrop-blur-[6px]',
    '[mask-image:linear-gradient(var(--edge-direction),black_30%,#000d_45%,#0008_65%,#0002_80%,transparent_95%)]',
  ),
  cn(
    'backdrop-blur-[14px]',
    '[mask-image:linear-gradient(var(--edge-direction),black_25%,#000d_40%,#0008_55%,#0002_70%,transparent_85%)]',
  ),
];

function EdgeBlur({ edge }: EdgeBlurProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-x-0',
        edge === 'top'
          ? 'absolute top-0 -bottom-24 z-0 [--edge-direction:to_bottom]'
          : 'fixed bottom-0 z-30 h-20 [--edge-direction:to_top]',
      )}
    >
      {/* Keep filters stationary while the page scrolls or fades. */}
      {layers.map((layer) => (
        <div
          className={cn('absolute inset-0', layer)}
          key={layer}
        />
      ))}
      {/* Tint suppresses text contrast without adding another filter. */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[linear-gradient(var(--edge-direction),rgb(9_9_9/80%)_0%,rgb(9_9_9/50%)_35%,rgb(9_9_9/25%)_60%,rgb(9_9_9/8%)_80%,transparent_100%)]',
          'not-supports-[backdrop-filter:blur(1px)]:bg-[linear-gradient(var(--edge-direction),#090909_35%,transparent_100%)]',
        )}
      />
    </div>
  );
}

export { EdgeBlur };
