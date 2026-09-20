import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, 'src');

const sharedPublicApiDirectories = [
  { name: 'animation', path: path.join(sourceRoot, 'shared', 'animation') },
  { name: 'component', path: path.join(sourceRoot, 'shared', 'components') },
  { name: 'hook', path: path.join(sourceRoot, 'shared', 'hooks') },
];

const sourceExtensions = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
]);

function collectSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath);
    }

    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      return [entryPath];
    }

    return [];
  });
}

function getLocation(filePath) {
  const relativePath = path.relative(sourceRoot, filePath);
  const [layer, moduleName] = relativePath.split(path.sep);

  return { layer, moduleName };
}

function resolveProjectImport(importerPath, specifier) {
  if (specifier.startsWith('@/')) {
    return path.resolve(sourceRoot, specifier.slice(2));
  }

  if (specifier.startsWith('.')) {
    return path.resolve(path.dirname(importerPath), specifier);
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

function getImports(sourceFile) {
  const imports = [];

  function addImport(node) {
    if (node && ts.isStringLiteralLike(node)) {
      imports.push({
        specifier: node.text,
        position: node.getStart(sourceFile),
      });
    }
  }

  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      addImport(node.moduleSpecifier);
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference)
    ) {
      addImport(node.moduleReference.expression);
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === 'require'))
    ) {
      addImport(node.arguments[0]);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return imports;
}

if (!fs.existsSync(sourceRoot)) {
  console.error(`Source directory does not exist: ${sourceRoot}`);
  process.exit(1);
}

const violations = [];

for (const directory of sharedPublicApiDirectories) {
  if (!fs.existsSync(directory.path)) {
    continue;
  }

  for (const entry of fs.readdirSync(directory.path, { withFileTypes: true })) {
    const entryPath = path.join(directory.path, entry.name);

    if (entry.isFile() && sourceExtensions.has(path.extname(entry.name))) {
      violations.push({
        file: path.relative(projectRoot, entryPath),
        line: 1,
        column: 1,
        specifier: entry.name,
        message: `shared ${directory.name}s must be in their own directory with index.ts`,
      });
    }

    const indexPath = path.join(entryPath, 'index.ts');

    const hasIndex =
      fs.existsSync(indexPath) && fs.statSync(indexPath).isFile();

    if (entry.isDirectory() && !hasIndex) {
      violations.push({
        file: path.relative(projectRoot, entryPath),
        line: 1,
        column: 1,
        specifier: entry.name,
        message: `shared ${directory.name} "${entry.name}" must have an index.ts`,
      });
    }
  }
}

for (const filePath of collectSourceFiles(sourceRoot)) {
  const sourceText = fs.readFileSync(filePath, 'utf8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
  );

  const importer = getLocation(filePath);

  for (const importedModule of getImports(sourceFile)) {
    const importedPath = resolveProjectImport(
      filePath,
      importedModule.specifier,
    );

    if (!importedPath) {
      continue;
    }

    const imported = getLocation(importedPath);

    const message = getViolation(importer, imported, filePath, importedPath);

    if (!message) {
      continue;
    }

    const { line, character } = sourceFile.getLineAndCharacterOfPosition(
      importedModule.position,
    );

    violations.push({
      file: path.relative(projectRoot, filePath),
      line: line + 1,
      column: character + 1,
      specifier: importedModule.specifier,
      message,
    });
  }
}

if (violations.length > 0) {
  console.error('Architecture violations:\n');

  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line}:${violation.column} ${violation.message}: ${violation.specifier}`,
    );
  }

  process.exit(1);
}

process.stdout.write('Architecture check passed.\n');
