export async function loadLegalMarkdown(path: string): Promise<string> {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load markdown file: ${path}`);
  }

  return await response.text();
}