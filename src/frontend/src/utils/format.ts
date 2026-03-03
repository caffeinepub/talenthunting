/**
 * Format a bigint nanosecond timestamp to a readable date string.
 */
export function formatTimestamp(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

/**
 * Format a RoleType enum to a human-readable label.
 */
export function formatRoleType(roleType: string): string {
  switch (roleType) {
    case "fullTime":
      return "Full-Time";
    case "partTime":
      return "Part-Time";
    case "contract":
      return "Contract";
    default:
      return roleType;
  }
}
