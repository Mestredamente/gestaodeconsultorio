import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({ message: 'Placeholder function to resolve missing entrypoint error' }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
