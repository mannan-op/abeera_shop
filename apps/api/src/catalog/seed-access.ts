import { timingSafeEqual } from "node:crypto";

export type SeedDecision = "ok" | "disabled" | "forbidden";

export function readHeader(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value.find((entry) => entry.trim().length > 0);
  }
  return value;
}

export function authorizeSeed(input: {
  seedToken: string | undefined;
  authorization: string | undefined;
  seedHeader: string | undefined;
}): SeedDecision {
  const expected = input.seedToken?.trim();
  if (!expected) return "disabled";

  const provided = providedTokens(input.authorization, input.seedHeader);
  if (provided.length === 0) return "forbidden";
  return provided.some((token) => tokensMatch(token, expected)) ? "ok" : "forbidden";
}

function providedTokens(authorization: string | undefined, seedHeader: string | undefined): string[] {
  const tokens: string[] = [];
  const header = seedHeader?.trim();
  if (header) tokens.push(header);
  const bearer = bearerToken(authorization);
  if (bearer) tokens.push(bearer);
  return tokens;
}

function bearerToken(authorization: string | undefined): string | undefined {
  if (!authorization) return undefined;
  const match = /^Bearer\s+(\S+)\s*$/i.exec(authorization.trim());
  return match?.[1];
}

function tokensMatch(provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  if (providedBytes.length !== expectedBytes.length) {
    timingSafeEqual(expectedBytes, expectedBytes);
    return false;
  }
  return timingSafeEqual(providedBytes, expectedBytes);
}
