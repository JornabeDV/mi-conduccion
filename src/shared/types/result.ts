export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export type ActionResult<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
