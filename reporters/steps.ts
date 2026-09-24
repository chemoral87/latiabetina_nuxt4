import type { Reporter, TestStep, TestCase, TestResult } from '@playwright/test/reporter'

export default class StepReporter implements Reporter {
  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep) {
    if (step.category !== 'test.step') return
    process.stdout.write(`${step.error ? '✘' : '✓'} ${step.title}\n`)
  }
}
