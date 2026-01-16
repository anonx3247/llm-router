export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: Error;
    };

export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err(error: any): Result<never> {
  if (typeof error === "string") {
    return { ok: false, error: new Error(error) };
  } else if (error instanceof Error) {
    return { ok: false, error };
  } else {
    return { ok: false, error: new Error(JSON.stringify(error)) };
  }
}
