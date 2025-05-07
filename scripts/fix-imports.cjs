#!/usr/bin/env node

/**
 * Script para padronizar importações dos tipos compartilhados no projeto GitAdventure
 * 
 * Este script vai procurar por todos os padrões de importação:
 * - import { X } from '../../../shared/types/enums'
 * - import { X } from '../../../../shared/types/enums'
 * - import { X } from '@gitadventure/shared/types/enums'
 * 
 * E substituir por:
 * - import { X } from '@shared/types'
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Diretórios a serem verificados
const DIRS_TO_CHECK = [
  'packages/backend/src',
  'packages/frontend/src'
];

// Padrões de importação a serem substituídos
const IMPORT_PATTERNS = [
  /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/shared\/types\/enums['"]/g,
  /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/types\/enums['"]/g,
  /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/shared\/types\/api['"]/g,
  /import\s+{([^}]+)}\s+from\s+['"]\.\.\/\.\.\/\.\.\/\.\.\/shared\/types\/api['"]/g,
  /import\s+{([^}]+)}\s+from\s+['"]@gitadventure\/shared\/types\/enums['"]/g,
  /import\s+{([^}]+)}\s+from\s+['"]@gitadventure\/shared\/types\/api['"]/g
];

// Função para verificar e modificar os arquivos
function processFile(filePath) {
  // Ignorar arquivos que não são TypeScript
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Verificar cada padrão
  IMPORT_PATTERNS.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, 'import {$1} from \'@shared/types\'');
      modified = true;
    }
  });

  // Salvar apenas se houver modificações
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Atualizado: ${filePath}`);
    return true;
  }

  return false;
}

// Função para percorrer diretórios recursivamente
function walkDir(dir) {
  let count = 0;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules')) {
      count += walkDir(filePath);
    } else if (stat.isFile()) {
      if (processFile(filePath)) {
        count++;
      }
    }
  });

  return count;
}

// Execução principal
console.log('📝 Iniciando padronização de importações...');

let totalModified = 0;
DIRS_TO_CHECK.forEach(dir => {
  console.log(`🔍 Verificando diretório: ${dir}`);
  totalModified += walkDir(dir);
});

console.log(`✨ Concluído! ${totalModified} arquivos foram modificados.`);

// Executar o TypeScript para verificar se há erros
try {
  console.log('🔧 Verificando TypeScript...');
  execSync('pnpm tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript OK!');
} catch (error) {
  console.error('❌ Erros de TypeScript encontrados!');
} 