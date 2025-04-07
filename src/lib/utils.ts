/**
 * Breaks a string into multiple lines, trying to break at spaces when possible.
 *
 * @param text The text to break into lines
 * @param maxCharsPerLine Maximum characters per line
 * @param minBreakLength Minimum length before forcing a break (used when no good spaces are found)
 * @returns Array of string lines
 */
export function breakTextIntoLines(
  text: string,
  maxCharsPerLine: number = 20,
  minBreakLength: number = maxCharsPerLine / 2
): string[] {
  // Early return if text already fits on a single line
  if (text.length <= maxCharsPerLine) {
    return [text];
  }

  const lines: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    // If remaining text fits on a line, add it and we're done
    if (remainingText.length <= maxCharsPerLine) {
      lines.push(remainingText);
      break;
    }

    // Look for a space to break at before the maxCharsPerLine
    let breakIndex = remainingText.lastIndexOf(' ', maxCharsPerLine);

    // If no good space found or it's too early in the string, force break at maxCharsPerLine
    if (breakIndex === -1 || breakIndex < minBreakLength) {
      breakIndex = maxCharsPerLine;
    }

    // Add the line and continue with remaining text
    lines.push(remainingText.substring(0, breakIndex));
    remainingText = remainingText.substring(breakIndex).trim();
  }

  return lines;
}

/**
 * Processes text with smart handling of various cases:
 * - Removes common prefixes like 'ghcr.io/', 'docker.io/'
 * - Truncates extremely long text with ellipsis
 * - Other custom processing as needed
 *
 * @param text The text to process
 * @returns Processed text
 */
export function processSourceText(text: string): string {
  if (!text) return '';

  // Remove common prefixes to make text more readable
  const prefixesToRemove = [
    'ghcr.io/',
    'docker.io/',
    'registry.hub.docker.com/library/',
  ];

  let processed = text;
  for (const prefix of prefixesToRemove) {
    if (processed.startsWith(prefix)) {
      processed = processed.substring(prefix.length);
      break; // Only remove one prefix
    }
  }

  // Truncate extremely long text (over 60 chars)
  const maxTotalLength = 60;
  if (processed.length > maxTotalLength) {
    processed = processed.substring(0, maxTotalLength - 3) + '...';
  }

  return processed;
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const formatTimestamp = (timestamp: string) =>
  new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
