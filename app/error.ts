export class NoUserError extends Error {
  constructor() {
    super("No user found with provided credentials");
  }
}

export class UnreachableCaseError extends Error {
  constructor(v: never) {
    super(`Unreachable case: ${v}`);
  }
}
