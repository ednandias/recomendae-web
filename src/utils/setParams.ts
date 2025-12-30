export function setParams(
  url: string,
  params: { key: string; value: string }[]
) {
  let searchParams = ``;

  const validParams = params.filter((param) => param.value);

  for (const [index, param] of validParams.entries()) {
    if (index === 0) {
      searchParams += `?${param.key}=${param.value}`;
    } else {
      searchParams += `&${param.key}=${param.value}`;
    }
  }

  return `${url}${searchParams}`;
}
