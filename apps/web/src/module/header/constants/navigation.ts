import { type LinkProps } from '@tanstack/react-router';

const navigation = [
  { label: 'EXPLORE', to: '/explore' },
  { label: 'EVIDENCE', to: '/evidence' },
  { label: 'METHOD', to: '/methodology' },
] as const satisfies readonly { label: string; to: LinkProps['to'] }[];

export { navigation };
