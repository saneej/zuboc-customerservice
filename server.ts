import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Ticket Creation and Email
  app.post("/api/tickets", async (req, res) => {
    try {
      const { subject, description, customer_email, query_type, workspace_id, priority, source } = req.body;

      // 1. Generate Ticket Number (ZUBXXXX)
      // Get count of existing tickets to generate next number
      const { count, error: countError } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const nextNumber = (count || 0) + 1001;
      const ticketNumber = `ZUB${nextNumber}`;

      // 2. Insert into Supabase
      const { data, error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            title: subject,
            description,
            customer_email,
            query_type,
            workspace_id,
            status: "open",
            priority: priority || "medium",
            metadata: { 
              ticket_number: ticketNumber,
              source: source || "web" 
            }
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Send Email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER || "mock_user",
          pass: process.env.SMTP_PASS || "mock_pass",
        },
      });

      const trackingUrl = `${req.protocol}://${req.get('host')}/track/${ticketNumber}`;

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #312131; line-height: 1.6; background-color: #FDFBF7; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(49, 33, 49, 0.05); border: 1px solid rgba(49, 33, 49, 0.05); }
            .header { background-color: #312131; padding: 40px; text-align: center; }
            .content { padding: 40px; }
            .footer { background-color: #FDFBF7; padding: 20px; text-align: center; font-size: 12px; color: rgba(49, 33, 49, 0.4); }
            .logo { width: 80px; filter: invert(1) brightness(0); }
            .ticket-badge { background-color: #FDFBF7; color: #312131; padding: 8px 16px; border-radius: 100px; font-weight: bold; display: inline-block; margin-bottom: 20px; border: 1px solid rgba(49, 33, 49, 0.1); }
            h1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 32px; margin-bottom: 10px; color: #312131; }
            p { margin-bottom: 20px; }
            .details { background-color: #FDFBF7; padding: 20px; border-radius: 16px; margin-top: 20px; }
            .details-item { margin-bottom: 10px; font-size: 14px; }
            .details-label { font-weight: bold; color: rgba(49, 33, 49, 0.6); text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
            .button { background-color: #312131; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" alt="Zuboc Logo" class="logo" style="filter: invert(1) brightness(100);">
            </div>
            <div class="content">
              <div class="ticket-badge">${ticketNumber}</div>
              <h1>Ticket Registered</h1>
              <p>Hello,</p>
              <p>Thank you for reaching out to Zuboc Desk. We've received your request and our team is already on it.</p>
              
              <div class="details">
                <div class="details-item">
                  <div class="details-label">Subject</div>
                  <div>${subject}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">Query Type</div>
                  <div>${query_type}</div>
                </div>
                <div class="details-item">
                  <div class="details-label">Source</div>
                  <div>${source || 'Web'}</div>
                </div>
              </div>
              
              <p style="margin-top: 30px;">You can track your ticket status by clicking the button below:</p>
              <a href="${trackingUrl}" class="button">Track My Ticket</a>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Zuboc Desk. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: '"Zuboc Desk" <support@zuboc.com>',
        to: customer_email,
        subject: `Ticket Registered: ${ticketNumber} - ${subject}`,
        html: htmlTemplate,
      });

      res.json({ success: true, ticket: { ...data, ticket_number: ticketNumber } });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
