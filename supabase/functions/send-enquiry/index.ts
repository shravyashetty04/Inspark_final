import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FORWARD_TO = "Connect@insparktech.in";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();
    const { name, email, phone, service, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: name, email, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Store enquiry in the database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: dbError } = await supabase.from("enquiries").insert({
      name,
      email,
      phone: phone || null,
      service: service || null,
      message,
    });

    if (dbError) {
      console.error("Database insert error:", dbError.message);
    }

    // Send email notification via Resend if API key is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    let emailSent = false;

    if (resendApiKey) {
      try {
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #7C3AED;">New Project Enquiry from ${name}</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Name:</td><td style="padding: 8px 0;">${name}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Phone:</td><td style="padding: 8px 0;">${phone || "Not provided"}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold; color: #333;">Service:</td><td style="padding: 8px 0;">${service || "Not specified"}</td></tr>
            </table>
            <h3 style="color: #333; margin-top: 20px;">Project Overview</h3>
            <p style="color: #555; line-height: 1.6; background: #f8f8f8; padding: 16px; border-radius: 8px;">${message}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">This enquiry was submitted via the inSpark website contact form.</p>
          </div>
        `;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "inSpark Enquiries <onboarding@resend.dev>",
            to: [FORWARD_TO],
            subject: `New Enquiry: ${service || "General"} — from ${name}`,
            html: emailHtml,
            reply_to: email,
          }),
        });

        if (res.ok) {
          emailSent = true;
        } else {
          const errText = await res.text();
          console.error("Resend API error:", errText);
        }
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    } else {
      console.log("RESEND_API_KEY not configured — enquiry saved to database only");
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailSent,
        message: emailSent
          ? "Enquiry received and forwarded to our team."
          : "Enquiry received. Our team will get back to you shortly.",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Handler error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
