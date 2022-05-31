export async function get({ url }) {
  const parts = url.href.split('/')
  const size = parts.pop()
  const path = parts.join('/')

  return {
    status: 200,
    body: {
      path,
      size
    }
  }
}