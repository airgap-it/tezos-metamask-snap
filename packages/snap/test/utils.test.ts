// eslint-disable-next-line jsdoc/require-jsdoc
export function jsonOk(body: any): Promise<Response> {
  const mockResponse = new global.Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return Promise.resolve(mockResponse);
}
