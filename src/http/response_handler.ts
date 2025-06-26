/**
 * Handles and parses the response
 */
export async function handleResponse(response: Response) {
  if (!response.ok) {
    console.error(
      `Error: Request failed with status ${response.status}: (${response.statusText})`,
    );
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    console.log(data);
    return;
  }

  // TODO: handle other content types.
}
