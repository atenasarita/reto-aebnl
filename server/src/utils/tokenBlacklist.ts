const revokedTokens = new Map<string, number>();

const pruneExpired = (nowSec: number) => {
  for (const [jti, exp] of revokedTokens) {
    if (exp <= nowSec) {
      revokedTokens.delete(jti);
    }
  }
};

export const revokeToken = (jti: string, exp: number): void => {
  revokedTokens.set(jti, exp);
  pruneExpired(Math.floor(Date.now() / 1000));
};

export const isTokenRevoked = (jti: string | undefined): boolean => {
  if (!jti) return false;

  const nowSec = Math.floor(Date.now() / 1000);
  pruneExpired(nowSec);

  return revokedTokens.has(jti);
};
