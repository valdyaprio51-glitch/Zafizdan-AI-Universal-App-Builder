import { IFrameworkAdapter, FrameworkMetadata, CommandDefinitions } from '../interfaces';

export class NextJsAdapter implements IFrameworkAdapter {
  readonly metadata: FrameworkMetadata = {
    id: 'nextjs',
    name: 'Next.js App Router',
    category: 'frontend',
    version: '14.2 / 15.0',
    supportedRuntimes: ['node >= 18.17'],
    description: 'The React Framework for the Web with Server Components and App Router.',
    isSupported: true,
  };

  readonly commandDefinitions: CommandDefinitions = {
    installDependencies: 'npm install',
    build: 'npm run build',
    test: 'npm test',
    lint: 'npm run lint',
    typecheck: 'npx tsc --noEmit',
    startDev: 'npm run dev',
    startProd: 'npm start',
  };

  validateCompatibility(): { compatible: boolean; reason?: string } {
    return { compatible: true };
  }

  getDefaultPort(): number {
    return 3000;
  }

  getHealthEndpoint(): string {
    return '/';
  }

  async generateScaffolding(appName: string): Promise<Array<{ path: string; content: string }>> {
    return [
      {
        path: 'frontend/package.json',
        content: JSON.stringify(
          {
            name: `${appName.toLowerCase()}-frontend`,
            version: '0.1.0',
            private: true,
            scripts: {
              dev: 'next dev -p 3000',
              build: 'next build',
              start: 'next start -p 3000',
              lint: 'next lint',
            },
            dependencies: {
              next: '^14.2.5',
              react: '^18.3.1',
              'react-dom': '^18.3.1',
              'lucide-react': '^0.414.0',
            },
            devDependencies: {
              '@types/node': '^20',
              '@types/react': '^18',
              '@types/react-dom': '^18',
              autoprefixer: '^10.4.20',
              postcss: '^8.4.40',
              tailwindcss: '^3.4.7',
              typescript: '^5',
            },
          },
          null,
          2
        ),
      },
    ];
  }
}

