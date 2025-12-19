'use client';

export type APIErrorResponse = {
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
};

export class ApiClientError extends Error {
    status: number;
    code: string;
    details?: unknown;

    constructor(status: number, code: string, message: string, details?: unknown) {
        super(message);
        this.name = 'ApiClientError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

export function isApiClientError(error: unknown): error is ApiClientError {
    return error instanceof ApiClientError;
}

function buildQueryString(params?: Record<string, unknown>) {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    for (const [key, rawValue] of Object.entries(params)) {
        if (rawValue === undefined || rawValue === null) continue;
        if (typeof rawValue === 'string' && rawValue.trim() === '') continue;

        if (Array.isArray(rawValue)) {
            for (const value of rawValue) {
                if (value === undefined || value === null) continue;
                searchParams.append(key, String(value));
            }
            continue;
        }

        searchParams.set(key, String(rawValue));
    }

    const qs = searchParams.toString();
    return qs ? `?${qs}` : '';
}

async function parseJsonSafe(res: Response) {
    const text = await res.text();
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function maybeRedirectToLogin(status: number) {
    if (typeof window === 'undefined') return;
    if (status !== 401 && status !== 403) return;
    if (window.location.pathname === '/login') return;
    window.location.href = '/login';
}

async function request<T>(method: string, url: string, body?: unknown, signal?: AbortSignal): Promise<T> {
    const res = await fetch(url, {
        method,
        headers: {
            Accept: 'application/json',
            ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        },
        credentials: 'include',
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
    });

    if (res.ok) {
        return (await parseJsonSafe(res)) as T;
    }

    const parsed = (await parseJsonSafe(res)) as APIErrorResponse | null;
    const code = parsed?.error?.code ?? 'HTTP_ERROR';
    const message = parsed?.error?.message ?? `Request failed (${res.status})`;
    const details = parsed?.error?.details;

    maybeRedirectToLogin(res.status);
    throw new ApiClientError(res.status, code, message, details);
}

export function apiGet<T>(path: string, params?: Record<string, unknown>, signal?: AbortSignal) {
    return request<T>('GET', `${path}${buildQueryString(params)}`, undefined, signal);
}

export function apiPost<T>(path: string, body?: unknown, signal?: AbortSignal) {
    return request<T>('POST', path, body, signal);
}

export function apiPatch<T>(path: string, body?: unknown, signal?: AbortSignal) {
    return request<T>('PATCH', path, body, signal);
}

export function apiDelete<T>(path: string, signal?: AbortSignal) {
    return request<T>('DELETE', path, undefined, signal);
}
