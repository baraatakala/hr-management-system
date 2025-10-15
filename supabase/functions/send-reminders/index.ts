import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
// Supabase automatically provides these environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface Employee {
  id: string
  name_en: string
  name_ar: string
  email: string
  passport_expiry: string | null
  card_expiry: string | null
  emirates_id_expiry: string | null
  residence_expiry: string | null
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Calculate date 30 days from now
    const today = new Date()
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(today.getDate() + 30)

    const todayStr = today.toISOString().split('T')[0]
    const thirtyDaysStr = thirtyDaysFromNow.toISOString().split('T')[0]

    // Fetch employees with expiring documents
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .not('email', 'is', null)
      .or(
        `passport_expiry.gte.${todayStr},passport_expiry.lte.${thirtyDaysStr},card_expiry.gte.${todayStr},card_expiry.lte.${thirtyDaysStr},emirates_id_expiry.gte.${todayStr},emirates_id_expiry.lte.${thirtyDaysStr},residence_expiry.gte.${todayStr},residence_expiry.lte.${thirtyDaysStr}`
      )

    if (error) throw error

    const results = []

    for (const employee of employees as Employee[]) {
      const expiringDocuments = []

      // Check each document type
      if (employee.passport_expiry && isExpiringSoon(employee.passport_expiry, thirtyDaysStr)) {
        expiringDocuments.push({
          type: 'passport',
          expiryDate: employee.passport_expiry,
        })
      }

      if (employee.card_expiry && isExpiringSoon(employee.card_expiry, thirtyDaysStr)) {
        expiringDocuments.push({
          type: 'card',
          expiryDate: employee.card_expiry,
        })
      }

      if (employee.emirates_id_expiry && isExpiringSoon(employee.emirates_id_expiry, thirtyDaysStr)) {
        expiringDocuments.push({
          type: 'emirates_id',
          expiryDate: employee.emirates_id_expiry,
        })
      }

      if (employee.residence_expiry && isExpiringSoon(employee.residence_expiry, thirtyDaysStr)) {
        expiringDocuments.push({
          type: 'residence',
          expiryDate: employee.residence_expiry,
        })
      }

      // Send email for each expiring document
      for (const doc of expiringDocuments) {
        try {
          // Send email via Resend (no duplicate check - always send)
          const emailSent = await sendEmail(employee, doc.type, doc.expiryDate)

          // Log reminder in database
          const { error: insertError } = await supabase.from('reminders').insert({
            employee_id: employee.id,
            type: doc.type,
            target_date: doc.expiryDate,
            status: emailSent ? 'sent' : 'failed',
            sent_at: emailSent ? new Date().toISOString() : null,
          })

          if (insertError) throw insertError

          results.push({
            employee: employee.name_en,
            document: doc.type,
            status: emailSent ? 'sent' : 'failed',
          })
        } catch (err) {
          console.error(`Error processing ${doc.type} for ${employee.name_en}:`, err)
          results.push({
            employee: employee.name_en,
            document: doc.type,
            status: 'error',
            error: err.message,
          })
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

function isExpiringSoon(expiryDate: string, thirtyDaysStr: string): boolean {
  return expiryDate >= new Date().toISOString().split('T')[0] && expiryDate <= thirtyDaysStr
}

async function sendEmail(employee: Employee, docType: string, expiryDate: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'HR Management <onboarding@resend.dev>',
        to: [employee.email],
        subject: `Document Expiry Reminder - ${docType.replace('_', ' ').toUpperCase()}`,
        html: `
          <h2>Document Expiry Reminder</h2>
          <p>Dear ${employee.name_en},</p>
          <p>This is a reminder that your <strong>${docType.replace('_', ' ')}</strong> is expiring soon.</p>
          <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
          <p>Please take necessary action to renew your document before it expires.</p>
          <br>
          <p>Best regards,<br>HR Management Team</p>
        `,
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
