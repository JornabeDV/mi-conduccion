export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = "No autorizado") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends DomainError {
  constructor(resource = "Recurso") {
    super(`${resource} no encontrado`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DomainError {
  constructor(message = "Datos inválidos") {
    super(message);
    this.name = "ValidationError";
  }
}
