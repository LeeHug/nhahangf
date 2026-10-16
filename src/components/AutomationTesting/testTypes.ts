export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

export type TestCategory = 
  | 'booking_conflict'
  | 'input_validation'
  | 'state_machine'
  | 'menu_pricing'
  | 'security_rbac'
  | 'e2e_flow';

export interface TestAssertion {
  description: string;
  passed: boolean;
  expected: any;
  actual: any;
}

export interface HttpRequestRecord {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface HttpResponseRecord {
  status: number;
  statusText: string;
  headers?: Record<string, string>;
  body?: any;
  durationMs: number;
}

export interface TestCase {
  id: string;
  suiteId: TestCategory;
  suiteName: string;
  name: string;
  description: string;
  viewpoint: string;
  technique: 'Phân vùng tương đương' | 'Phân tích giá trị biên' | 'Kiểm thử chuyển trạng thái' | 'Kiểm thử an ninh' | 'Kiểm thử tích hợp E2E';
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';
  expectedStatusCode: number;
  expectedCode?: string;
  prerequisites?: string;
  steps: string[];
  expectedResult: string;
  // Dynamic execution state
  status: TestStatus;
  durationMs?: number;
  requestRecord?: HttpRequestRecord;
  responseRecord?: HttpResponseRecord;
  assertions?: TestAssertion[];
  logs?: string[];
  errorMessage?: string;
  executedAt?: string;
}

export interface TestSuiteSummary {
  id: TestCategory;
  name: string;
  description: string;
  iconName: string;
  total: number;
  passed: number;
  failed: number;
  running: number;
  idle: number;
}

export interface TestRunReport {
  runId: string;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  passRate: number;
  targetEnvironment: string;
  suites: {
    suiteId: TestCategory;
    name: string;
    total: number;
    passed: number;
    failed: number;
  }[];
  tests: TestCase[];
}
