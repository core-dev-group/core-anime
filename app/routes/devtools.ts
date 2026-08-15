export async function loader() {
  return new Response("{}", {
    headers: { "Content-Type": "application/json" },
    status: 200
  });
}
