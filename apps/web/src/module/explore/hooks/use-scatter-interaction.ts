import { type PointerEvent, useEffect, useRef, useState } from 'react';

import { type ScatterPoint } from '../types/scatter-point';
import { findNearestPointId } from '../utils/find-nearest-point-id';

function useScatterInteraction(
  points: readonly ScatterPoint[],
  axisMax: number,
) {
  const [plotElement, setPlotElement] = useState<HTMLDivElement | null>(null);
  const boundsRef = useRef<DOMRect | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!plotElement) {
      boundsRef.current = null;

      return undefined;
    }

    const updateBounds = () => {
      boundsRef.current = plotElement.getBoundingClientRect();
    };

    updateBounds();

    const observer = new ResizeObserver(updateBounds);
    observer.observe(plotElement);
    window.addEventListener('scroll', updateBounds, true);
    window.addEventListener('resize', updateBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateBounds, true);
      window.removeEventListener('resize', updateBounds);
    };
  }, [plotElement]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    const bounds = boundsRef.current;
    if (!bounds) return;

    const nearestId = findNearestPointId(
      points,
      {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        width: bounds.width,
        height: bounds.height,
      },
      axisMax,
    );

    setActiveId(nearestId);
  };

  const onPointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;

    boundsRef.current = event.currentTarget.getBoundingClientRect();
    onPointerMove(event);
  };

  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') setActiveId(null);
  };

  const onActiveChange = (id: string, open: boolean) => {
    setActiveId((currentId) => {
      if (open) return id;

      return currentId === id ? null : currentId;
    });
  };

  return {
    setPlotElement,
    activeId,
    onActiveChange,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
  };
}

export { useScatterInteraction };
