import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const claimSchema = z.object({
  ownerEmail: z.string().email().max(255),
  ownerName: z.string().trim().min(1).max(100),
  claimerName: z.string().trim().min(1).max(100),
  claimerEmail: z.string().email().max(255),
  postTitle: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000)
});

// HTML escape function to prevent XSS
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

interface ClaimNotificationRequest {
  ownerEmail: string;
  ownerName: string;
  claimerName: string;
  claimerEmail: string;
  postTitle: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate input data
    const validatedData = claimSchema.parse(requestData);
    const { ownerEmail, ownerName, claimerName, claimerEmail, postTitle, message } = validatedData;

    console.log("Sending claim notification email to:", ownerEmail);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Send email using Resend API directly
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Back2Me <onboarding@resend.dev>",
        to: [ownerEmail],
        subject: `Nouvelle réclamation pour "${postTitle}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Nouvelle réclamation reçue 🔔</h1>
            <p>Bonjour ${escapeHtml(ownerName)},</p>
            <p>Vous avez reçu une nouvelle réclamation pour votre annonce <strong>"${escapeHtml(postTitle)}"</strong>.</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Détails du demandeur:</h3>
              <p><strong>Nom:</strong> ${escapeHtml(claimerName)}</p>
              <p><strong>Email:</strong> ${escapeHtml(claimerEmail)}</p>
              
              <h3>Message:</h3>
              <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
            </div>
            
            <p>Vous pouvez répondre directement à cette personne à l'adresse: <strong>${escapeHtml(claimerEmail)}</strong></p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              Cordialement,<br>
              L'équipe Back2Me
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      throw new Error(`Resend API error: ${JSON.stringify(errorData)}`);
    }

    const emailData = await emailResponse.json();
    console.log("Email sent successfully:", emailData);

    return new Response(JSON.stringify(emailData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-claim-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
