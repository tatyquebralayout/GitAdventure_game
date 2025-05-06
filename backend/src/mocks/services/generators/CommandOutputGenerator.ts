import { faker } from '@faker-js/faker';

export interface CommandResult {
  output: string;
  error?: string;
  exitCode: number;
}

export class CommandOutputGenerator {
  static generateLsOutput(files: string[]): CommandResult {
    return {
      output: files.join('\n'),
      exitCode: 0
    };
  }

  static generatePwdOutput(path: string): CommandResult {
    return {
      output: path,
      exitCode: 0
    };
  }

  static generateCdOutput(success: boolean, path?: string): CommandResult {
    if (success) {
      return {
        output: '',
        exitCode: 0
      };
    }
    return {
      output: '',
      error: `cd: no such file or directory: ${path}`,
      exitCode: 1
    };
  }

  static generateMkdirOutput(success: boolean, path?: string): CommandResult {
    if (success) {
      return {
        output: '',
        exitCode: 0
      };
    }
    return {
      output: '',
      error: `mkdir: cannot create directory '${path}': File exists`,
      exitCode: 1
    };
  }

  static generateRmOutput(success: boolean, path?: string): CommandResult {
    if (success) {
      return {
        output: '',
        exitCode: 0
      };
    }
    return {
      output: '',
      error: `rm: cannot remove '${path}': No such file or directory`,
      exitCode: 1
    };
  }

  static generateCatOutput(content: string | null, path: string): CommandResult {
    if (content === null) {
      return {
        output: '',
        error: `cat: ${path}: No such file or directory`,
        exitCode: 1
      };
    }
    return {
      output: content,
      exitCode: 0
    };
  }

  static generateErrorOutput(command: string, errorMessage: string): CommandResult {
    return {
      output: '',
      error: `${command}: ${errorMessage}`,
      exitCode: 1
    };
  }

  static generateSuccessOutput(output: string = ''): CommandResult {
    return {
      output,
      exitCode: 0
    };
  }

  static generateCompileOutput(success: boolean, errors?: string[]): CommandResult {
    if (success) {
      return {
        output: 'Compilation complete. No errors found.',
        exitCode: 0
      };
    }

    const errorOutput = errors?.length 
      ? errors.join('\n')
      : 'Error: Compilation failed with multiple errors';

    return {
      output: '',
      error: errorOutput,
      exitCode: 1
    };
  }

  static generateTestOutput(passed: number, failed: number, skipped: number): CommandResult {
    const total = passed + failed + skipped;
    const output = [
      'Test Results:',
      `Total Tests: ${total}`,
      `Passed: ${passed}`,
      `Failed: ${failed}`,
      `Skipped: ${skipped}`,
      '',
      failed === 0 ? 'Test suite passed!' : 'Test suite failed.'
    ].join('\n');

    return {
      output,
      exitCode: failed > 0 ? 1 : 0
    };
  }

  static generateRandomCommandError(): CommandResult {
    const errors = [
      'command not found',
      'permission denied',
      'invalid argument',
      'operation not permitted',
      'no such file or directory'
    ];

    return {
      output: '',
      error: `Error: ${faker.helpers.arrayElement(errors)}`,
      exitCode: 1
    };
  }
}