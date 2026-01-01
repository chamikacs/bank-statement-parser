/**
 * Text Normalization Utilities
 * 
 * Functions for cleaning and normalizing extracted PDF text
 */

/**
 * Normalize line breaks to consistent LF format
 */
export function normalizeLineBreaks(text: string): string {
  // Convert CRLF (\r\n) and CR (\r) to LF (\n)
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Remove null bytes and non-printable control characters
 * Preserves newlines and tabs
 */
export function removeControlCharacters(text: string): string {
  // Remove null bytes
  let cleaned = text.replace(/\0/g, '');
  
  // Remove control characters except newline (\n), tab (\t), and carriage return (\r)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return cleaned;
}

/**
 * Normalize whitespace while preserving structure
 */
export function normalizeWhitespace(text: string): string {
  // Split into lines
  const lines = text.split('\n');
  
  // Process each line
  const normalizedLines = lines.map((line) => {
    // Collapse multiple spaces to single space
    let normalized = line.replace(/[ \t]+/g, ' ');
    
    // Trim leading and trailing whitespace
    normalized = normalized.trim();
    
    return normalized;
  });
  
  // Remove empty lines and rejoin
  const nonEmptyLines = normalizedLines.filter((line) => line.length > 0);
  
  return nonEmptyLines.join('\n');
}

/**
 * Complete normalization pipeline for extracted PDF text
 */
export function normalizeExtractedText(text: string): string {
  // Apply normalization steps in sequence
  let normalized = text;
  
  // 1. Normalize line breaks
  normalized = normalizeLineBreaks(normalized);
  
  // 2. Remove control characters
  normalized = removeControlCharacters(normalized);
  
  // 3. Normalize whitespace
  normalized = normalizeWhitespace(normalized);
  
  return normalized;
}

/**
 * Clean page text before concatenation
 */
export function cleanPageText(pageText: string): string {
  // Apply basic normalization
  return normalizeExtractedText(pageText);
}
