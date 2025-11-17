// Cloudflare Pages Function - Submit Feedback/Testimonial
interface Env {
  DB: D1Database
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { name, email, message, rating } = await context.request.json()
    
    if (!message || message.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return new Response(JSON.stringify({ error: 'Rating must be between 1 and 5' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await context.env.DB.prepare(
      'INSERT INTO feedback (name, email, message, rating) VALUES (?, ?, ?, ?)'
    )
      .bind(
        name?.trim() || null, 
        email?.trim() || null, 
        message.trim(), 
        rating || null
      )
      .run()

    return new Response(
      JSON.stringify({ 
        success: true, 
        id: result.meta.last_row_id,
        message: 'Thank you for your feedback!' 
      }),
      {
        status: 201,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  } catch (error) {
    console.error('Error submitting feedback:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to submit feedback' }),
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
