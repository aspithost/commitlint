export function executeStep(description: string, fn: () => unknown) {
  try {
    fn();
  } catch {
    console.error(`\nFailed to ${description}. Please check the error above and retry.`);
    process.exitCode = 1;
  }
}
