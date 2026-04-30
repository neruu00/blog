/**
 * @file runner.js
 * @description 하네스 자가 검증 런너.
 *              프로젝트의 기본적인 기술적 상태를 점검합니다.
 */

const { execSync } = require('child_process');

function runCommand(command) {
  try {
    console.log(`\n> Running: ${command}`);
    // stdio: 'inherit'을 사용하여 버퍼 제한 없이 실시간으로 출력을 스트리밍합니다.
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`\n❌ Error during ${command}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Harness Self-Evaluation...\n');

  const steps = [
    { name: 'Syntax & Types', command: 'npx tsc --noEmit' },
    { name: 'Linting', command: 'pnpm lint' },
    { name: 'Build Check', command: 'pnpm build' },
  ];

  let successCount = 0;

  for (const step of steps) {
    console.log(`--- Step: ${step.name} ---`);
    if (runCommand(step.command)) {
      successCount++;
    }
  }

  console.log('\n--- Evaluation Summary ---');
  console.log(`Total Steps: ${steps.length}`);
  console.log(`Passed: ${successCount}`);
  console.log(`Failed: ${steps.length - successCount}`);

  if (successCount === steps.length) {
    console.log('\n✅ All technical criteria passed! You are ready to submit.');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some criteria failed. Please review and fix before submission.');
    process.exit(1);
  }
}

main();
