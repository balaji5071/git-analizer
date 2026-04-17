const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

function isGitHubHost(hostname: string) {
  return hostname === "github.com" || hostname === "www.github.com";
}

export function normalizeGitHubUsernameInput(input: unknown) {
  if (typeof input !== "string") {
    return "";
  }

  let value = input.trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);

      if (isGitHubHost(url.hostname.toLowerCase())) {
        const [firstSegment] = url.pathname.split("/").filter(Boolean);
        value = firstSegment ?? "";
      }
    } catch {
      // Keep the original value when URL parsing fails.
    }
  }

  value = value.replace(/^@+/, "").replace(/\/+$/, "").trim();

  return value;
}

export function isValidGitHubUsername(value: string) {
  return GITHUB_USERNAME_PATTERN.test(value);
}
