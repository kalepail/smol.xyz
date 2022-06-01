export default async function test(req, env, ctx) {
  const { TEST } = env

  if (req?.params?.key) {
    const item = await TEST.get(req.params.key)

    if (!item)
      return new Response('Object Not Found', { status: 404 })

    return new Response(item.body)
  }

  else {
    const items = await TEST.list()

    return new Response(JSON.stringify(items), {
      headers: {
        'Content-Type': 'application/json',
      }
    })
  }
}