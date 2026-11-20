function fingerprint(value) {
  if (!value) return '(EMPTY)';
  return `len=${value.length} first=${value.charCodeAt(0)} last=${value.charCodeAt(value.length - 1)}`;
}

export function logEnvDiagnostics() {
  const keys = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME'];
  const lines = ['--- DB ENV DIAGNOSTIC ---'];
  for (const key of keys) {
    lines.push(`${key} = [${process.env[key] ?? '(undefined)'}]`);
  }
  lines.push(`DB_PASSWORD ${fingerprint(process.env.DB_PASSWORD)}`);
  console.log(lines.join('\n'));
}
