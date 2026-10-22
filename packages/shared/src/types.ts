// Domain Enums and Types for Universal AI App Builder

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PLANNING = 'PLANNING',
  GENERATING = 'GENERATING',
  INSTALLING_DEPENDENCIES = 'INSTALLING_DEPENDENCIES',
  TESTING = 'TESTING',
  BUILDING = 'BUILDING',
  STARTING = 'STARTING',
  RUNNING = 'RUNNING',
  FAILED = 'FAILED',
  STOPPED = 'STOPPED',
}

export enum ApplicationType {
  WEB = 'web',
  SAAS = 'saas',
  API = 'api',
  MOBILE = 'mobile',
  DESKTOP = 'desktop',
  CLI = 'cli',
  FULL_STACK = 'full_stack',
}

export enum FrontendFramework {
  NEXTJS = 'nextjs',
  REACT_VITE = 'react_vite',
  VUE_NUXT = 'vue_nuxt',
  ANGULAR = 'angular',
  SVELTEKIT = 'sveltekit',
  ASTRO = 'astro',
  HTML_CSS_JS = 'html_css_js',
  FLUTTER = 'flutter',
  REACT_NATIVE = 'react_native',
  NONE = 'none',
}

export enum BackendFramework {
  NODE_EXPRESS = 'node_express',
  NODE_FASTIFY = 'node_fastify',
  NODE_NESTJS = 'node_nestjs',
  ASPNET_CORE = 'aspnet_core',
  PYTHON_FASTAPI = 'python_fastapi',
  PYTHON_DJANGO = 'python_django',
  LARAVEL = 'laravel',
  SPRING_BOOT = 'spring_boot',
  GO_HTTP = 'go_http',
  NONE = 'none',
}

export enum DatabaseType {
  POSTGRESQL = 'postgresql',
  MYSQL = 'mysql',
  SQLSERVER = 'sqlserver',
  SQLITE = 'sqlite',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  NONE = 'none',
}

export enum AuthStrategy {
  JWT = 'jwt',
  SESSION = 'session',
  OAUTH2 = 'oauth2',
  API_KEY = 'api_key',
  NONE = 'none',
}

export enum AuthorizationStrategy {
  RBAC = 'rbac',
  ABAC = 'abac',
  NONE = 'none',
}

export enum PipelineStage {
  STAGE_1_REQUIREMENT_ANALYSIS = 'STAGE_1_REQUIREMENT_ANALYSIS',
  STAGE_2_ARCHITECTURE_PLANNING = 'STAGE_2_ARCHITECTURE_PLANNING',
  STAGE_3_PROJECT_SCAFFOLDING = 'STAGE_3_PROJECT_SCAFFOLDING',
  STAGE_4_DATABASE_GENERATION = 'STAGE_4_DATABASE_GENERATION',
  STAGE_5_BACKEND_GENERATION = 'STAGE_5_BACKEND_GENERATION',
  STAGE_6_FRONTEND_GENERATION = 'STAGE_6_FRONTEND_GENERATION',
  STAGE_7_INTEGRATION = 'STAGE_7_INTEGRATION',
  STAGE_8_AUTOMATED_QA = 'STAGE_8_AUTOMATED_QA',
  STAGE_9_AI_REPAIR_LOOP = 'STAGE_9_AI_REPAIR_LOOP',
  STAGE_10_BUILD_AND_RUN = 'STAGE_10_BUILD_AND_RUN',
  STAGE_11_DELIVERY = 'STAGE_11_DELIVERY',
}

export enum AIProviderType {
  GOOGLE_GEMINI = 'google_gemini',
  OPENAI = 'openai',
  ANTHROPIC = 'anthropic',
  OLLAMA = 'ollama',
  OPENAI_COMPATIBLE = 'openai_compatible',
  MOCK = 'mock',
}

export interface AIProviderConfig {
  id: string;
  name: string;
  type: AIProviderType;
  endpoint?: string;
  apiKey?: string;
  model: string;
  temperature?: number;
  tokenBudget?: number;
  timeoutMs?: number;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  isDefault?: boolean;
  isValidated?: boolean;
}

export interface ProjectConfiguration {
  id: string;
  projectId: string;
  appName: string;
  description: string;
  appType: ApplicationType;
  frontend: FrontendFramework;
  backend: BackendFramework;
  language: string;
  database: DatabaseType;
  orm?: string;
  auth: AuthStrategy;
  authorization: AuthorizationStrategy;
  uiLibrary?: string;
  apiStyle?: string;
  testFramework?: string;
  packageManager?: string;
  runtimeVersion?: string;
  deploymentTarget?: string;
  dockerEnabled: boolean;
  aiProviderId?: string;
  envVariables?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  isExecutable?: boolean;
  encoding?: 'utf-8' | 'base64';
}

export interface FileTreeNode {
  id: string;
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  updatedAt?: string;
  children?: FileTreeNode[];
}

export interface GenerationPlan {
  summary: string;
  userStories: string[];
  features: string[];
  architectureOverview: string;
  components: {
    frontend?: { framework: string; pages: string[]; components: string[] };
    backend?: { framework: string; endpoints: string[]; models: string[] };
    database?: { type: string; tables: string[] };
  };
  fileManifest: string[];
}

export interface QualityCheckResult {
  passed: boolean;
  checkType: 'lint' | 'typecheck' | 'unit_test' | 'integration_test' | 'build' | 'security';
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  errorsFound: Array<{
    file?: string;
    line?: number;
    column?: number;
    message: string;
    category: 'syntax' | 'type' | 'runtime' | 'dependency' | 'build' | 'other';
  }>;
}

export interface RepairAttempt {
  attemptNumber: number;
  stage: PipelineStage;
  errorSummary: string;
  rootCause: string;
  patchesApplied: Array<{
    filePath: string;
    diff: string;
  }>;
  verificationPassed: boolean;
}

export interface RuntimeStatus {
  projectId: string;
  status: ProjectStatus;
  port?: number;
  previewUrl?: string;
  pid?: number;
  memoryUsageMb?: number;
  cpuPercent?: number;
  startedAt?: string;
  uptimeSeconds?: number;
  error?: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: 'pipeline' | 'worker' | 'runtime' | 'ai' | 'qa';
  stage?: PipelineStage;
  message: string;
}
