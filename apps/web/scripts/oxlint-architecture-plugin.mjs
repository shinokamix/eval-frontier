import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'src',
);

const sharedPublicApiDirectories = [
  { name: 'animation', path: path.join(sourceRoot, 'shared', 'animation') },
  { name: 'component', path: path.join(sourceRoot, 'shared', 'components') },
  { name: 'hook', path: path.join(sourceRoot, 'shared', 'hooks') },
];

const sourceExtensions = ['.js', '.jsx', '.mjs', '.mts', '.ts', '.tsx'];

function getLocation(filePath) {
  const relativePath = path.relative(sourceRoot, filePath);

  if (
    relativePath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativePath)
  ) {
    return null;
  }

  const [layer, moduleName] = relativePath.split(path.sep);

  return { layer, moduleName };
}

function resolveSourceFile(filePath) {
  const candidates = [
    filePath,
    ...sourceExtensions.map((extension) => `${filePath}${extension}`),
    ...sourceExtensions.map((extension) =>
      path.join(filePath, `index${extension}`),
    ),
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? filePath;
}

function resolveProjectImport(importerPath, specifier) {
  if (specifier.startsWith('@/')) {
    return resolveSourceFile(path.join(sourceRoot, specifier.slice(2)));
  }

  if (specifier.startsWith('.')) {
    return resolveSourceFile(
      path.resolve(path.dirname(importerPath), specifier),
    );
  }

  return null;
}

function isModulePublicApi(importedPath) {
  const parts = path.relative(sourceRoot, importedPath).split(path.sep);

  return (
    parts.length === 2 ||
    (parts.length === 3 && path.parse(parts[2]).name === 'index')
  );
}

function getSharedPublicApiEntry(filePath) {
  for (const directory of sharedPublicApiDirectories) {
    const relativePath = path.relative(directory.path, filePath);

    if (
      relativePath !== '' &&
      relativePath !== '..' &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath)
    ) {
      return { directory, path: relativePath.split(path.sep) };
    }
  }

  return null;
}

function isSharedPublicApi(entryPath) {
  return (
    entryPath.length === 1 ||
    (entryPath.length === 2 && path.parse(entryPath[1]).name === 'index')
  );
}

function getSharedStructureViolations() {
  const violations = [];

  for (const directory of sharedPublicApiDirectories) {
    if (!fs.existsSync(directory.path)) continue;

    for (const entry of fs.readdirSync(directory.path, {
      withFileTypes: true,
    })) {
      const entryPath = path.join(directory.path, entry.name);

      if (
        entry.isFile() &&
        sourceExtensions.includes(path.extname(entry.name))
      ) {
        violations.push(
          `shared ${directory.name}s must be in their own directory with index.ts: ${entry.name}`,
        );

        continue;
      }

      if (
        entry.isDirectory() &&
        !fs.existsSync(path.join(entryPath, 'index.ts'))
      ) {
        violations.push(
          `shared ${directory.name} "${entry.name}" must have an index.ts`,
        );
      }
    }
  }

  return violations;
}

function getViolation(importer, imported, importerPath, importedPath) {
  if (
    importer.layer === 'shared' &&
    ['app', 'module'].includes(imported.layer)
  ) {
    return `shared cannot import ${imported.layer}`;
  }

  if (importer.layer === 'module') {
    if (imported.layer === 'app') {
      return `module "${importer.moduleName}" cannot import app`;
    }

    if (
      imported.layer === 'module' &&
      imported.moduleName !== importer.moduleName
    ) {
      return `module "${importer.moduleName}" cannot import module "${imported.moduleName}"`;
    }
  }

  const crossesModuleBoundary =
    imported.layer === 'module' &&
    (importer.layer !== 'module' ||
      importer.moduleName !== imported.moduleName);

  if (crossesModuleBoundary && !isModulePublicApi(importedPath)) {
    return `module "${imported.moduleName}" must be imported through its index.ts`;
  }

  const importerSharedEntry = getSharedPublicApiEntry(importerPath);
  const importedSharedEntry = getSharedPublicApiEntry(importedPath);

  const crossesSharedEntryBoundary =
    importedSharedEntry &&
    (!importerSharedEntry ||
      importerSharedEntry.directory.path !==
        importedSharedEntry.directory.path ||
      importerSharedEntry.path[0] !== importedSharedEntry.path[0]);

  if (
    crossesSharedEntryBoundary &&
    !isSharedPublicApi(importedSharedEntry.path)
  ) {
    return `shared ${importedSharedEntry.directory.name} "${importedSharedEntry.path[0]}" must be imported through its index.ts`;
  }

  return null;
}

function createRule(context) {
  const reportImport = (node, specifier) => {
    if (!node || typeof specifier !== 'string') return;

    const importerPath = path.isAbsolute(context.filename)
      ? context.filename
      : path.resolve(process.cwd(), context.filename);

    const importer = getLocation(importerPath);
    const importedPath = resolveProjectImport(importerPath, specifier);

    if (!importer || !importedPath) return;

    const imported = getLocation(importedPath);

    const message = imported
      ? getViolation(importer, imported, importerPath, importedPath)
      : null;

    if (message) {
      context.report({ message: `${message}: ${specifier}`, node });
    }
  };

  return {
    Program(node) {
      const importerPath = path.isAbsolute(context.filename)
        ? context.filename
        : path.resolve(process.cwd(), context.filename);

      const relativePath = path.relative(sourceRoot, importerPath);

      if (relativePath === path.join('app', 'main.tsx')) {
        for (const message of getSharedStructureViolations()) {
          context.report({ message, node });
        }
      }
    },
    ImportDeclaration(node) {
      reportImport(node.source, node.source.value);
    },
    ExportAllDeclaration(node) {
      reportImport(node.source, node.source?.value);
    },
    ExportNamedDeclaration(node) {
      reportImport(node.source, node.source?.value);
    },
    ImportExpression(node) {
      reportImport(node.source, node.source.value);
    },
    TSImportEqualsDeclaration(node) {
      const expression = node.moduleReference?.expression;

      reportImport(expression, expression?.value);
    },
    CallExpression(node) {
      const isRequire =
        node.callee?.type === 'Identifier' && node.callee.name === 'require';

      if (isRequire && node.arguments.length > 0) {
        const argument = node.arguments[0];

        if (argument.type === 'Literal') {
          reportImport(argument, argument.value);
        }
      }
    },
  };
}

export default {
  meta: { name: 'architecture' },
  rules: {
    boundaries: {
      meta: {
        type: 'problem',
        docs: { description: 'Enforce application module boundaries' },
      },
      create: createRule,
    },
  },
};
