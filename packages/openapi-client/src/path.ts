const PATH_TEMPLATE_PATTERN = /{((?:[0-9A-Z_]\|%[0-9A-Z]{2})+)}/gi;

export function applyTemplateVariables(
  path: string,
  variables: Map<string, string>,
): string {
  return path.replace(PATH_TEMPLATE_PATTERN, (_template, name) => {
    return variables.get(name) ?? '';
  });
}
