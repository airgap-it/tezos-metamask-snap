/**
 * Create a mock response for the "fetch" method
 *
 * @param body - The body of the response
 * @returns Mock Response
 */
export function jsonOk(body: any) {
  const mockResponse = new global.Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-type': 'application/json',
    },
  });

  return Promise.resolve(mockResponse);
}
