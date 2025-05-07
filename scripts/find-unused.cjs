const { execSync } = require('child_process');

const ignore = ['node_modules', 'dist', 'build', 'coverage', 'scripts'];

function run(cmd, label) {
  try {
    const result = execSync(cmd, { encoding: 'utf8' });
    if (result.trim()) {
      console.log(`\n[${label}]\n${result}`);
    } else {
      console.log(`\n[${label}] Nenhum resíduo encontrado.`);
    }
  } catch (e) {
    if (e.stdout && e.stdout.trim()) {
      console.log(`\n[${label}]\n${e.stdout}`);
    } else {
      console.log(`\n[${label}] Nenhum resíduo encontrado.`);
    }
  }
}

// Backend
run('npx ts-unused-exports packages/backend/tsconfig.json', 'backend');

// Frontend
run('npx ts-unused-exports tsconfig.app.json frontend/src/**/*.ts frontend/src/**/*.tsx', 'frontend'); 