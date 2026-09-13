import { Article } from '@/shared/components/article';
import { ArticleSection } from '@/shared/components/article-section';
import { Text } from '@/shared/components/text';

import { ArticleLink } from './article-link';
import { HarnessDiagram } from './harness-diagram';

interface HarnessLinkProps {
  readonly children: string;
  readonly href: string;
}

function HarnessLink(props: Readonly<HarnessLinkProps>) {
  return (
    <a
      className="border-b border-white/40"
      href={props.href}
      rel="noreferrer"
      target="_blank"
    >
      <Text variant="inline">{props.children}</Text>
    </a>
  );
}

function OverviewArticle() {
  return (
    <Article>
      <ArticleSection>
        <Text variant="heading">What this project studies</Text>
        <Text variant="body">
          This project studies how the choice of coding-agent harness changes
          the performance of an AI model.
        </Text>
        <Text variant="body">
          It collects published benchmark results and compares runs in which the
          model, tasks, and evaluation procedure stay the same while the harness
          changes. When a source provides the data, the comparison includes
          tasks solved, cost, runtime, and token use.
        </Text>
        <Text variant="body">
          The goal is not to name one best harness. The goal is to show which
          setups offer useful tradeoffs under the conditions of each study.
        </Text>
        <div>
          <ArticleLink to="/explore">Explore the results →</ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">Model and harness</Text>
        <Text variant="body">
          An AI model generates text and code from the instructions and context
          it receives. Models used for coding include Claude, GPT, Gemini, and
          others.
        </Text>
        <Text variant="body">
          A coding harness is the software that connects the model to a
          repository. It gives the model instructions and context, lets it read
          files, edit code, and run commands, then decides what happens after
          each action.
        </Text>
        <HarnessDiagram />
        <Text variant="body">
          Harnesses differ in how they search a repository, prepare context,
          call tools, apply edits, manage errors, and decide when a task is
          complete. These choices can change the result even when the model and
          task stay the same.
        </Text>
        <Text variant="body">
          The model and harness together form the setup being evaluated. Each
          comparison uses the same model release and configuration, not only the
          same model family name.
        </Text>
        <Text variant="body">
          Harnesses represented in the dataset include{' '}
          <HarnessLink href="https://github.com/badlogic/pi-mono">
            Pi
          </HarnessLink>
          ,{' '}
          <HarnessLink href="https://github.com/openai/codex">
            Codex
          </HarnessLink>
          ,{' '}
          <HarnessLink href="https://github.com/anthropics/claude-code">
            Claude Code
          </HarnessLink>
          ,{' '}
          <HarnessLink href="https://github.com/anomalyco/opencode">
            OpenCode
          </HarnessLink>
          ,{' '}
          <HarnessLink href="https://github.com/can1357/oh-my-pi">
            Oh My Pi
          </HarnessLink>
          , and others reported by the original sources.
        </Text>
        <div>
          <ArticleLink href="https://www.langchain.com/blog/the-anatomy-of-an-agent-harness">
            The anatomy of an agent harness, LangChain →
          </ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">How results are compared</Text>
        <Text variant="body">
          Results are compared only when they come from the same published study
          and use the same model, task set, scoring procedure, and study
          conditions. The harness is the part that changes.
        </Text>
        <Text variant="body">
          Runs with different models, tasks, or evaluation rules remain in
          separate groups. Results from separate studies are not combined, even
          when they use the same benchmark name.
        </Text>
        <Text variant="body">
          Quality is compared with one resource measure at a time, such as cost,
          runtime, or token use. The project does not combine these measures
          into a single score. Instead, it identifies results that are not worse
          than another available result on both measures.
        </Text>
        <div>
          <ArticleLink to="/methodology">Read the methodology →</ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">Data and interpretation</Text>
        <Text variant="body">
          The dataset is built from public benchmark reports, result tables,
          repositories, and other materials published by harness authors and
          independent researchers. Every recorded result links to its original
          source and retains the reported conditions, metric definitions, and
          known caveats.
        </Text>
        <Text variant="body">
          Missing values remain missing. A result may appear in one comparison
          and be absent from another when the source does not report the
          required metric.
        </Text>
        <Text variant="body">
          The results describe what happened under the conditions of a
          particular study. They do not prove that one harness will perform
          better on every repository. Use the comparisons to identify
          candidates, inspect the original evidence, and test the relevant
          setups on your own tasks.
        </Text>
        <div>
          <ArticleLink to="/evidence">View the sources →</ArticleLink>
        </div>
      </ArticleSection>

      <ArticleSection>
        <Text variant="heading">Open source and contributions</Text>
        <Text variant="body">
          This project is open source. The dataset, comparison logic,
          methodology, and website code are available on GitHub.
        </Text>
        <Text variant="body">
          Anyone can contribute. You can add a published benchmark, correct a
          source record, improve the methodology, fix the website, or propose a
          new way to present the data. If you are unsure where to start, open an
          issue with a source, correction, or idea.
        </Text>
        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <ArticleLink to="/explore">Explore the results →</ArticleLink>
          <ArticleLink href="https://github.com/shinokamix/harness-pareto">
            View the project on GitHub →
          </ArticleLink>
        </div>
      </ArticleSection>
    </Article>
  );
}

export { OverviewArticle };
