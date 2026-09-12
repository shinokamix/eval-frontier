import { Text } from '@/shared/components/text';

const exampleConfigurations = [
  { cost: '$2', label: 'Setup A', result: 'KEEP', score: '82%' },
  { cost: '$1', label: 'Setup B', result: 'KEEP', score: '79%' },
  { cost: '$2', label: 'Setup C', result: 'REMOVE', score: '78%' },
] as const;

function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-lg border-y border-white/20 text-left">
        <thead>
          <tr className="border-b border-white/20">
            <th className="py-3 pr-3">
              <Text variant="value">SETUP</Text>
            </th>
            <th className="px-3 py-3">
              <Text variant="value">TASKS SOLVED</Text>
            </th>
            <th className="px-3 py-3">
              <Text variant="value">COST PER TASK</Text>
            </th>
            <th className="py-3 pl-3 text-right">
              <Text variant="value">RESULT</Text>
            </th>
          </tr>
        </thead>
        <tbody>
          {exampleConfigurations.map((configuration) => (
            <tr
              className="border-b border-white/15 last:border-b-0"
              key={configuration.label}
            >
              <td className="py-5 pr-3">
                <Text variant="value">{configuration.label}</Text>
              </td>
              <td className="px-3 py-5">
                <Text variant="value">{configuration.score}</Text>
              </td>
              <td className="px-3 py-5">
                <Text variant="value">{configuration.cost}</Text>
              </td>
              <td
                className={
                  configuration.result === 'REMOVE'
                    ? 'py-5 pl-3 text-right text-white/40'
                    : 'py-5 pl-3 text-right'
                }
              >
                <Text variant="value">{configuration.result}</Text>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { ComparisonTable };
