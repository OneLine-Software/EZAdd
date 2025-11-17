// Cloudflare Pages Function - Submit Feature Request
interface Env {
  DB: D1Database
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { title, description, email } = await context.request.json()
    
    if (!title || title.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Title is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO feature_requests (title, description, email) VALUES (?, ?, ?)'
    )
      .bind(title.trim(), description?.trim() || null, email?.trim() || null)
      .run()

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: result.meta.last_row_id,
        message: 'Feature request submitted successfully!' 
      }),
      {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*' // Allow from your domain
        }
      }
    )
  } catch (error) {
    console.error('Error submitting feature request:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to submit feature request' }),
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
