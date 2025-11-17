// Cloudflare Pages Function - Log Anonymous Usage Stats
interface Env {
  DB: D1Database
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { event_type, metadata } = await context.request.json()
    
    if (!event_type) {
      return new Response(JSON.stringify({ error: 'event_type is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await context.env.DB.prepare(
      'INSERT INTO app_stats (event_type, metadata) VALUES (?, ?)'
    )
      .bind(event_type, metadata ? JSON.stringify(metadata) : null)
      .run()

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('Error logging stats:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to log stats' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Handle CORS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}
