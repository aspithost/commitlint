import { executeStep } from './executeStep.js';

describe('executeStep', () => {
  beforeEach(() => {
    console.error = vi.fn();
  });

  it('should run the step function', () => {
    const step = vi.fn();

    executeStep('Run some function', step);

    expect(step).toHaveBeenCalledOnce();
  });

  it('should not exit when the step succeeds', () => {
    executeStep('Run some function', vi.fn());

    expect(process.exitCode).toBeUndefined();
  });

  it('should exit with code 1 when the step throws', () => {
    executeStep('Run some function', () => {
      throw new Error('Some error');
    });

    expect(process.exitCode).toBe(1);
  });
});
