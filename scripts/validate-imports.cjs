#!/usr/bin/env node

/**
 * Script para validar importações dos tipos compartilhados no projeto GitAdventure
 * 
 * Este script vai procurar por todos os padrões de importação incorretos:
 * - import { X } from '../../../shared/types/enums'
 * - import { X } from '../../../../shared/types/enums'
 * - import { X } from '@gitadventure/shared/types/enums'
 * 
 * E vai falhar o build se encontrar algum desses padrões, indicando
 * que deve ser usado o formato correto:
 * - import { X } from '@shared/types'
 */

const fs = require('fs');
const path = require('path');

// Diretórios a serem verificados
const DIRS_TO_CHECK = [
  'packages/backend/src',
  'packages/frontend/src'
];

// Padrões de importação inválidos
const INVALID_IMPORT_PATTERNS = [
  /import\s+{[^}]+}\s+from\s+['"]\.\.\/\.\.\/\.\.\/shared\/types\/enums['"]/,
  /import\s+{[^}]+}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/types\/enums['"]/,
  /import\s+{[^}]+}\s+from\s+['"]\.\.\/\.\.\/\.\.\/shared\/types\/api['"]/,
  /import\s+{[^}]+}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/types\/api['"]/,
  /import\s+{[^}]+}\s+from\s+['"]@gitadventure\/shared\/types\/enums['"]/,
  /import\s+{[^}]+}\s+from\s+['"]@gitadventure\/shared\/types\/api['"]/
];

// Função para verificar um arquivo
function validateFile(filePath) {
  // Ignorar arquivos que não são TypeScript
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const errors = [];

  // Verificar cada padrão
  INVALID_IMPORT_PATTERNS.forEach(pattern => {
    const match = content.match(pattern);
    if (match) {
      errors.push({
        file: filePath,
        line: getLineNumber(content, match.index),
        match: match[0]
      });
    }
  });

  return errors;
}

// Função auxiliar para encontrar o número da linha
function getLineNumber(text, index) {
  const lines = text.substring(0, index).split('\n');
  return lines.length;
}

// Função para percorrer diretórios recursivamente
function validateDir(dir) {
  let errors = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      errors = errors.concat(validateDir(filePath));
    } else if (stat.isFile()) {
      errors = errors.concat(validateFile(filePath));
    }
  });

  return errors;
}

// Execução principal
console.log('🔍 Validando padrões de importação...');

let allErrors = [];
DIRS_TO_CHECK.forEach(dir => {
  if (fs.existsSync(dir)) {
    allErrors = allErrors.concat(validateDir(dir));
  } else {
    console.warn(`⚠️ Diretório não encontrado: ${dir}`);
  }
});

// Reportar erros
if (allErrors.length > 0) {
  console.error('\n❌ Importações inválidas encontradas:');
  
  allErrors.forEach(error => {
    console.error(`\n${error.file}:${error.line}`);
    console.error(`  ${error.match}`);
    console.error('  Use: import { ... } from \'@shared/types\';');
  });

  console.error(`\n❌ Encontrados ${allErrors.length} erros. Execute 'pnpm fix-imports' para corrigir.\n`);
  process.exit(1);
} else {
  console.log('✅ Todos os arquivos usam o padrão de importação correto.');
} 