import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req: Request) => {
  return new Response(
    JSON.stringify({ message: 'Dummy function to fix entrypoint missing error' }),
    {
      headers: { 'Content-Type': 'application/json', Connection: 'keep-alive' },
    },
  )
})
