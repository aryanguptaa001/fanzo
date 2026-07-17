export type ApiError = {
  code: string;
  message: string;
  requestId: string;
  details?: Record<string, unknown>;
};

export type HealthStatus = { status: 'ok'; timestamp: string };
