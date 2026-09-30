export function notFound() {
  return new Response(`{ 'message': 'not found' }`, {
    status: 404,
    headers: {
      "content-type": "applicatio/json",
    },
  });
}
