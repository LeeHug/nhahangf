export type TestCategory = 
  | 'infrastructure'
  | 'auth_rbac'
  | 'table_availability'
  | 'booking_validation'
  | 'conflict_prevention'
  | 'menu_pricing'
  | 'state_machine'
  | 'table_service'
  | 'billing_payment'
  | 'lookup_privacy'
  | 'reviews_feedback';

export type TestType = 'VALID' | 'INVALID' | 'BOUNDARY' | 'SECURITY';

export type TestStatus = 'idle' | 'running' | 'passed' | 'failed' | 'skipped';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface TestAssertion {
  description: string;
  passed: boolean;
  expected: string | number | boolean;
  actual: string | number | boolean;
  error?: string;
}

export interface HttpRequestRecord {
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
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
  id: string; // e.g., 'TC-01'
  sequenceNumber: number; // 1 -> 100
  title: string;
  category: TestCategory;
  type: TestType;
  technique: string;
  description: string;
  prerequisites: string;
  testDataSummary: string;
  expectedResult: string;
  httpMethod: HttpMethod;
  endpoint: string;
  requestPayload?: any;
  headers?: Record<string, string>;
  expectedStatus: number | number[];
  status: TestStatus;
  durationMs?: number;
  lastRun?: string;
  requestRecord?: HttpRequestRecord;
  responseRecord?: HttpResponseRecord;
  assertions: TestAssertion[];
  errorMessage?: string;
  requiresContextId?: boolean; // Whether it relies on dynamic ID from previous step
  requiresAuth?: 'admin' | 'staff' | 'customer' | 'none';
}

export interface ExecutionStats {
  total: number;
  passed: number;
  failed: number;
  running: number;
  skipped: number;
  idle: number;
  successRate: number;
  avgDurationMs: number;
  totalDurationSeconds: number;
}

export interface ConsoleLogItem {
  id: string;
  timestamp: string;
  text: string;
  type: 'info' | 'pass' | 'fail' | 'warn' | 'request' | 'response';
}
