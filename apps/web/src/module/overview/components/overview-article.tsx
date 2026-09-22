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
          It collects published benchmark results with their task outcomes,
          costs, runtime, and token use when the source reports them.
        </Text>
        <Text variant="body">
          The current dataset keeps each measurement linked to the source that
          reported it. Research results will appear here when the analysis is
          ready.
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
          Model, harness, and effort identify the setup recorded in the dataset.
          Published run settings remain available in the captured source files.
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
          The current dataset contains source measurements. The Explore page
          will display research results after the analysis is ready.
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
          <ArticleLink href="https://github.com/shinokamix/eval-frontier">
            View the project on GitHub →
          </ArticleLink>
        </div>
      </ArticleSection>
    </Article>
  );
}

export { OverviewArticle };
