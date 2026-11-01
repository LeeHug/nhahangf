import { TestCase, TestAssertion, HttpRequestRecord, HttpResponseRecord } from '../types/testTypes';

export interface TestExecutionContext {
  baseUrl: string;
  authToken?: string;
  adminToken?: string;
  staffToken?: string;
  lastCreatedReservationId?: string;
  lastCreatedBookingCode?: string;
}

/**
 * Execute a single test case against the target backend server
 */
export async function executeTestCase(
  tc: TestCase,
  context: TestExecutionContext,
  onLog?: (text: string, type: 'info' | 'pass' | 'fail' | 'warn' | 'request' | 'response') => void
): Promise<{ updatedCase: TestCase; nextContext: TestExecutionContext }> {
  const startTime = performance.now();
  const nextContext = { ...context };

  // Prepare URL
  let resolvedEndpoint = tc.endpoint;
  if (tc.requiresContextId && nextContext.lastCreatedReservationId) {
    resolvedEndpoint = resolvedEndpoint.replace('last-created', nextContext.lastCreatedReservationId);
  }

  const fullUrl = `${context.baseUrl.replace(/\/$/, '')}${resolvedEndpoint}`;

  // Prepare Headers
  const requestHeaders: Record<string, string> = {
    'Accept': 'application/json',
    ...(tc.headers || {})
  };

  if (tc.requestPayload) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // Inject authentication tokens if requested or implied
  if (!requestHeaders['Authorization']) {
    if (tc.requiresAuth === 'admin' && nextContext.adminToken) {
      requestHeaders['Authorization'] = `Bearer ${nextContext.adminToken}`;
    } else if (tc.requiresAuth === 'staff' && (nextContext.staffToken || nextContext.adminToken)) {
      requestHeaders['Authorization'] = `Bearer ${nextContext.staffToken || nextContext.adminToken}`;
    } else if (tc.requiresAuth === 'customer' && nextContext.authToken) {
      requestHeaders['Authorization'] = `Bearer ${nextContext.authToken}`;
    } else if (!tc.requiresAuth && (tc.category === 'state_machine' || tc.endpoint.includes('/admin'))) {
      if (nextContext.adminToken) {
        requestHeaders['Authorization'] = `Bearer ${nextContext.adminToken}`;
      } else if (nextContext.staffToken) {
        requestHeaders['Authorization'] = `Bearer ${nextContext.staffToken}`;
      }
    }
  }

  const requestRecord: HttpRequestRecord = {
    method: tc.httpMethod,
    url: fullUrl,
    headers: requestHeaders,
    body: tc.requestPayload
  };

  onLog?.(`[${tc.id}] Bắt đầu: ${tc.httpMethod} ${resolvedEndpoint} - "${tc.title}"`, 'request');

  const assertions: TestAssertion[] = [];

  try {
    const fetchOptions: RequestInit = {
      method: tc.httpMethod,
      headers: requestHeaders
    };

    if (tc.requestPayload && tc.httpMethod !== 'GET' && tc.httpMethod !== 'DELETE') {
      fetchOptions.body = JSON.stringify(tc.requestPayload);
    }

    const res = await fetch(fullUrl, fetchOptions);
    const durationMs = Math.round(performance.now() - startTime);

    let responseBody: any = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        responseBody = await res.json();
      } catch {
        responseBody = await res.text();
      }
    } else {
      responseBody = await res.text();
    }

    const responseRecord: HttpResponseRecord = {
      status: res.status,
      statusText: res.statusText,
      body: responseBody,
      durationMs
    };

    // Evaluate Expected Status
    const expectedStatuses = Array.isArray(tc.expectedStatus) ? tc.expectedStatus : [tc.expectedStatus];
    const isStatusMatched = expectedStatuses.includes(res.status);

    assertions.push({
      description: `Mã phản hồi HTTP (${expectedStatuses.join(' hoặc ')})`,
      passed: isStatusMatched,
      expected: expectedStatuses.join(' | '),
      actual: res.status
    });

    // Capture context tokens or reservation IDs
    if (res.status >= 200 && res.status < 300) {
      if (responseBody?.token) {
        if (tc.id === 'TC-06' || tc.id === 'TC-08') nextContext.authToken = responseBody.token;
        if (tc.id === 'TC-11' || tc.id === 'TC-13') nextContext.adminToken = responseBody.token;
        if (tc.id === 'TC-12' || tc.id === 'TC-14') nextContext.staffToken = responseBody.token;
      }
      if (responseBody?.id || responseBody?.reservation?.id) {
        nextContext.lastCreatedReservationId = responseBody?.id || responseBody?.reservation?.id;
      }
      if (responseBody?.bookingCode || responseBody?.reservation?.bookingCode) {
        nextContext.lastCreatedBookingCode = responseBody?.bookingCode || responseBody?.reservation?.bookingCode;
      }
    }

    // Specific Domain Assertions
    if (tc.id === 'TC-01') {
      const isHealthOk = responseBody?.status === 'ok';
      assertions.push({
        description: 'Server health status = "ok"',
        passed: isHealthOk,
        expected: 'ok',
        actual: responseBody?.status || 'undefined'
      });
    }

    if (tc.id === 'TC-02') {
      const isTablesArray = Array.isArray(responseBody);
      assertions.push({
        description: 'Phản hồi chứa mảng danh sách bàn',
        passed: isTablesArray && responseBody.length > 0,
        expected: 'Array(tables) > 0',
        actual: isTablesArray ? `${responseBody.length} bàn` : 'Không phải mảng'
      });
    }

    if (tc.id === 'TC-03') {
      const isMenuValid = Array.isArray(responseBody) && responseBody.length > 0;
      assertions.push({
        description: 'Tải thành công danh mục món ăn thực đơn',
        passed: isMenuValid,
        expected: 'Menu items > 0',
        actual: isMenuValid ? `${responseBody.length} mục` : 'Rỗng'
      });
    }

    if (tc.category === 'conflict_prevention' && tc.type === 'INVALID') {
      const isConflictDetected = res.status === 409 || res.status === 400;
      assertions.push({
        description: 'Hệ thống phát hiện xung đột và từ chối đặt trùng bàn',
        passed: isConflictDetected,
        expected: 'HTTP 409 (hoặc 400)',
        actual: res.status
      });
    }

    if (tc.type === 'SECURITY') {
      const isProtected = res.status !== 500;
      assertions.push({
        description: 'Không phát sinh lỗi crash 500 do lỗ hổng bảo mật',
        passed: isProtected,
        expected: 'HTTP 400, 401, 403 hoặc 200 (không crash)',
        actual: res.status
      });
    }

    const allPassed = assertions.every(a => a.passed);
    const finalStatus = allPassed ? 'passed' : 'failed';

    if (finalStatus === 'passed') {
      onLog?.(`[${tc.id}] THÀNH CÔNG: HTTP ${res.status} (${durationMs}ms)`, 'pass');
    } else {
      onLog?.(`[${tc.id}] THẤT BẠI: Nhận HTTP ${res.status}, kỳ vọng ${expectedStatuses.join('/')}`, 'fail');
    }

    const updatedCase: TestCase = {
      ...tc,
      status: finalStatus,
      durationMs,
      lastRun: new Date().toLocaleTimeString('vi-VN'),
      requestRecord,
      responseRecord,
      assertions,
      errorMessage: allPassed ? undefined : `Kỳ vọng HTTP [${expectedStatuses.join(', ')}] nhưng nhận ${res.status}`
    };

    return { updatedCase, nextContext };

  } catch (error: any) {
    const durationMs = Math.round(performance.now() - startTime);
    onLog?.(`[${tc.id}] LỖI KẾT NỐI: ${error?.message || error}`, 'fail');

    assertions.push({
      description: 'Kết nối mạng tới máy chủ API',
      passed: false,
      expected: 'Kết nối thành công',
      actual: error?.message || 'Network Error',
      error: error?.message
    });

    const updatedCase: TestCase = {
      ...tc,
      status: 'failed',
      durationMs,
      lastRun: new Date().toLocaleTimeString('vi-VN'),
      requestRecord,
      assertions,
      errorMessage: `Lỗi kết nối mạng: ${error?.message || 'Không thể kết nối tới server'}`
    };

    return { updatedCase, nextContext };
  }
}

/**
 * Ping check to verify server connectivity
 */
export async function pingServer(baseUrl: string): Promise<{ ok: boolean; statusText: string; latencyMs: number }> {
  const start = performance.now();
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/health`, { method: 'GET' });
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: res.ok,
      statusText: `HTTP ${res.status} ${res.statusText}`,
      latencyMs
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      statusText: err?.message || 'Không thể kết nối',
      latencyMs
    };
  }
}

/**
 * Reset sandbox data via API
 */
export async function resetServerSandbox(baseUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/test/reset-sandbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.ok;
  } catch {
    return false;
  }
}
