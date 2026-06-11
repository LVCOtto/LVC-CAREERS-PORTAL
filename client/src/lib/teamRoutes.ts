function toBase64Url(value: string) {
  return btoa(encodeURIComponent(value))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string) {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  return decodeURIComponent(atob(padded));
}

export function buildTeamMemberHref(memberId: string) {
  return `/team/member/${toBase64Url(memberId)}`;
}

export function decodeTeamMemberRouteId(encodedMemberId: string) {
  try {
    return fromBase64Url(encodedMemberId);
  } catch {
    return encodedMemberId;
  }
}