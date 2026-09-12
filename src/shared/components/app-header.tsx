import { Link } from '@tanstack/react-router';

import { Text } from '@/shared/components/text';

const navigation = [
  { label: 'Overview', to: '/' },
  { label: 'Explore', to: '/explore' },
  { label: 'Evidence', to: '/evidence' },
  { label: 'Methodology', to: '/methodology' },
] as const;

function AppHeader() {
  return (
    <header className="border-b border-black/10 bg-white">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex min-h-16 max-w-6xl items-center gap-2 overflow-x-auto px-6"
      >
        {navigation.map((item) => (
          <Link
            activeOptions={{ exact: item.to === '/' }}
            activeProps={{ className: 'bg-black !text-white' }}
            className="rounded-full px-4 py-2 text-black transition-colors hover:bg-black/5"
            key={item.to}
            to={item.to}
          >
            <Text
              as="span"
              className="text-sm leading-none"
              variant="inline"
            >
              {item.label}
            </Text>
          </Link>
        ))}
      </nav>
    </header>
  );
}

export { AppHeader };
