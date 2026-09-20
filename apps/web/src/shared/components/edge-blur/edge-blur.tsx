import { cn } from 'cn';

const layerCount = 8;
const fadeStep = 100 / (layerCount + 1);

const blurLayers = Array.from({ length: layerCount }, (_, index) => {
  const start = (layerCount - 1 - index) * fadeStep;
  const stop = (position: number) => `${start + position * fadeStep * 2}%`;
  const blur = `blur(calc(var(--edge-blur) * ${2 ** ((index - layerCount + 1) / 2)}))`;
  // Overlap adjacent fades and ease their opacity to soften layer boundaries.
  const mask = `linear-gradient(var(--edge-direction), black ${stop(0)}, rgb(0 0 0 / 84.375%) ${stop(0.25)}, rgb(0 0 0 / 50%) ${stop(0.5)}, rgb(0 0 0 / 15.625%) ${stop(0.75)}, transparent ${stop(1)})`;

  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
});

interface EdgeBlurProps {
  readonly edge: 'top' | 'bottom';
}

function EdgeBlur({ edge }: EdgeBlurProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none inset-x-0',
        edge === 'top'
          ? 'fixed top-0 z-30 h-[calc(var(--header-height)+6rem)] [--edge-blur:14px] [--edge-direction:to_bottom]'
          : 'fixed bottom-0 z-30 h-10 [--edge-blur:8px] [--edge-direction:to_top] md:h-20 md:[--edge-blur:14px]',
      )}
    >
      {/* Sample 48px past the visible fade. Mask the extra area without clipping the filter. */}
      {blurLayers.map((layer) => (
        <div
          className={cn(
            'absolute inset-x-0 [mask-repeat:no-repeat] [mask-size:100%_calc(100%_-_3rem)]',
            edge === 'top'
              ? 'top-0 -bottom-12 [mask-position:top]'
              : '-top-12 bottom-0 [mask-position:bottom]',
          )}
          key={layer.backdropFilter}
          style={layer}
        />
      ))}
      {/* Pixels outside the viewport cannot contribute to blur. Cover that edge. */}
      <div
        className={cn(
          'absolute inset-0',
          'bg-[linear-gradient(var(--edge-direction),#090909_0%,rgb(9_9_9/50%)_35%,rgb(9_9_9/25%)_60%,rgb(9_9_9/8%)_80%,transparent_100%)]',
          'not-supports-[backdrop-filter:blur(1px)]:bg-[linear-gradient(var(--edge-direction),#090909_35%,transparent_100%)]',
        )}
      />
    </div>
  );
}

export { EdgeBlur };
