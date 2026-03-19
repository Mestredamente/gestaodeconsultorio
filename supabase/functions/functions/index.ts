import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async (req) => {
  return new Response(JSON.stringify({ status: 'ok', message: 'functions edge function works' }), {
    headers: {
      'Content-Type': 'application/json',
    },
    status: 200,
  })
})
