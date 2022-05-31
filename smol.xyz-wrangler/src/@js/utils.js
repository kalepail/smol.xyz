export async function handleResponse(response) {
  const isResponseJson = response.headers.get('content-type')?.indexOf('json') > -1

  if (response.ok)
    return isResponseJson
    ? response.json() 
    : response.text()

  throw isResponseJson
  ? {
    ...await response.json(),
    status: response.status
  }
  : await response.text()
}

export function shajs(text) {
  return crypto.subtle.digest(
    {name: 'SHA-256'},
    new TextEncoder().encode(text)
  ).then(Buffer.from)
}