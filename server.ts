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

// Admin client for auth operations
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware for ALL routes
  app.use((req, res, next) => {
    console.log(`[Request] ${req.method} ${req.url}`);
    next();
  });

  // API Route for Ticket Creation and Email
  app.post("/api/tickets", async (req, res) => {
    console.log("Received ticket creation request:", req.body);
    try {
      const { subject, description, customer_email, customer_phone, query_type, workspace_id, priority, source, attachments } = req.body;

      if (!subject || !customer_email) {
        return res.status(400).json({ success: false, error: "Subject and customer email are required" });
      }

      // Ensure we have a valid workspace_id
      let finalWorkspaceId = workspace_id;
      if (!finalWorkspaceId || finalWorkspaceId === '00000000-0000-0000-0000-000000000000') {
        const { data: workspaces } = await supabase.from('workspaces').select('id').limit(1);
        if (workspaces && workspaces.length > 0) {
          finalWorkspaceId = workspaces[0].id;
        } else {
          // Create default workspace if none exists
          const { data: newWorkspace, error: wsError } = await supabase
            .from('workspaces')
            .insert([{ name: 'Default Workspace', slug: 'default' }])
            .select()
            .single();
          if (wsError) throw wsError;
          finalWorkspaceId = newWorkspace.id;
        }
      }

      // 1. Generate Ticket Number (ZUBXXXX)
      const { count, error: countError } = await supabase
        .from("tickets")
        .select("*", { count: "exact", head: true });

      if (countError) throw countError;

      const nextNumber = (count || 0) + 1001;
      const ticketNumber = `ZUB${nextNumber}`;

      // 2. Auto-assignment logic
      let assignedTo = null;
      try {
        const { data: availableAgents, error: agentError } = await supabase
          .from("profiles")
          .select("id")
          .eq("workspace_id", finalWorkspaceId)
          .eq("is_available", true)
          .in("role", ["agent", "manager", "admin"])
          .order("last_assigned_at", { ascending: true })
          .limit(1);

        if (!agentError && availableAgents && availableAgents.length > 0) {
          assignedTo = availableAgents[0].id;
          // Update last_assigned_at for the agent
          await supabase
            .from("profiles")
            .update({ last_assigned_at: new Date().toISOString() })
            .eq("id", assignedTo);
        }
      } catch (assignError) {
        console.error("Auto-assignment failed:", assignError);
      }

      // 3. Insert into Supabase
      const { data, error: insertError } = await supabase
        .from("tickets")
        .insert([
          {
            title: subject,
            description,
            workspace_id: finalWorkspaceId,
            status: "open",
            priority: priority || "medium",
            ticket_number: ticketNumber,
            customer_email,
            customer_phone,
            query_type,
            source: source || "web",
            attachments: attachments || [],
            assigned_to: assignedTo,
            metadata: { 
              created_via: "api"
            }
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 4. Fetch Sender Email from Workspace Settings
      const { data: workspace, error: workspaceError } = await supabase
        .from("workspaces")
        .select("settings")
        .eq("id", finalWorkspaceId)
        .single();

      const senderEmail = workspace?.settings?.sender_email || "zuboc@vdermauae.com";

      // 5. Send Email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || "mock_user",
          pass: process.env.SMTP_PASS || "mock_pass",
        },
      });

      const trackingUrl = `https://zuboc-customerservice.vercel.app/track/${ticketNumber}`;

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

      try {
        await transporter.sendMail({
          from: `"Zuboc Desk" <${senderEmail}>`,
          to: customer_email,
          subject: `Ticket Registered: ${ticketNumber} - ${subject}`,
          html: htmlTemplate,
        });
      } catch (emailErr) {
        console.error("Email sending failed:", emailErr);
      }

      res.json({ success: true, ticket: { ...data, ticket_number: ticketNumber } });
    } catch (error: any) {
      console.error("Error creating ticket:", error);
      // Ensure we always return JSON
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          error: error.message || "An internal server error occurred" 
        });
      }
    }
  });

  // API Route for sending reply notifications
  app.post("/api/notifications/reply", async (req, res) => {
    const { ticket_id, body, customer_email, ticket_number, subject, workspace_id } = req.body;

    try {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("settings")
        .eq("id", workspace_id)
        .single();

      const senderEmail = workspace?.settings?.sender_email || "zuboc@vdermauae.com";

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || "mock_user",
          pass: process.env.SMTP_PASS || "mock_pass",
        },
      });

      const trackingUrl = `https://zuboc-customerservice.vercel.app/track/${ticket_number || ticket_id}`;

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
            h1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 24px; margin-bottom: 20px; color: #312131; }
            .message-box { background-color: #FDFBF7; padding: 20px; border-radius: 16px; border-left: 4px solid #312131; margin: 20px 0; }
            .button { background-color: #312131; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" alt="Zuboc Logo" class="logo" style="filter: invert(1) brightness(100);">
            </div>
            <div class="content">
              <div class="ticket-badge">#${ticket_number || 'Ticket'}</div>
              <h1>New Response from Zuboc Desk</h1>
              <p>Hello,</p>
              <p>Our team has responded to your ticket regarding <strong>"${subject}"</strong>:</p>
              
              <div class="message-box">
                ${body}
              </div>
              
              <p>You can view the full conversation and reply by clicking the button below:</p>
              <a href="${trackingUrl}" class="button">View Ticket</a>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Zuboc Desk. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Zuboc Desk Support" <${senderEmail}>`,
        to: customer_email,
        subject: `Re: [${ticket_number}] ${subject}`,
        html: htmlTemplate,
      });

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending reply notification:", error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false,
          error: error.message || "Failed to send notification" 
        });
      }
    }
  });

  // API Route for Admin to add users
  app.post("/api/admin/add-user", async (req, res) => {
    const { email, fullName, role, workspace_id } = req.body;

    try {
      if (!email || !fullName) {
        return res.status(400).json({ success: false, error: "Email and Full Name are required" });
      }

      // 1. Generate a random password
      const tempPassword = Math.random().toString(36).slice(-10) + "!";

      // 2. Create user in Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (authError) throw authError;

      // 3. Update the profile with role and workspace
      // The trigger handle_new_user should have already created the profile, 
      // but we might need to update the role and workspace_id if it's not default.
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: role || 'agent',
          workspace_id: workspace_id,
          full_name: fullName
        })
        .eq('id', authUser.user.id);

      if (profileError) {
        console.error("Error updating profile after auth creation:", profileError);
      }

      // 4. Send Welcome Email
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.ethereal.email",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || "mock_user",
          pass: process.env.SMTP_PASS || "mock_pass",
        },
      });

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
            .logo { width: 80px; filter: invert(1) brightness(100); }
            h1 { font-family: 'Cormorant Garamond', serif; font-style: italic; font-size: 32px; margin-bottom: 10px; color: #312131; }
            .credentials { background-color: #FDFBF7; padding: 20px; border-radius: 16px; margin-top: 20px; border: 1px solid rgba(49, 33, 49, 0.1); }
            .credential-item { margin-bottom: 10px; font-size: 14px; }
            .credential-label { font-weight: bold; color: rgba(49, 33, 49, 0.6); text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
            .button { background-color: #312131; color: #ffffff !important; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; display: inline-block; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://zuboc.com/cdn/shop/files/zuboc_logo_1.svg?v=1748579899" alt="Zuboc Logo" class="logo">
            </div>
            <div class="content">
              <h1>Welcome to Zuboc Desk</h1>
              <p>Hello ${fullName},</p>
              <p>You have been added as an agent to the Zuboc Desk support team. You can now log in and start assisting customers.</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <div class="credential-label">Login URL</div>
                  <div>https://zuboc-desk.vercel.app/login</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">Email</div>
                  <div>${email}</div>
                </div>
                <div class="credential-item">
                  <div class="credential-label">Temporary Password</div>
                  <div style="font-family: monospace; font-weight: bold; font-size: 18px; color: #312131;">${tempPassword}</div>
                </div>
              </div>
              
              <p style="margin-top: 30px; font-size: 13px; color: rgba(49, 33, 49, 0.6);">Please change your password immediately after your first login for security reasons.</p>
              
              <a href="https://zuboc-desk.vercel.app/login" class="button">Log In Now</a>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Zuboc Desk. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Zuboc Desk" <zuboc@vdermauae.com>`,
        to: email,
        subject: `Welcome to Zuboc Desk - Your Account is Ready`,
        html: htmlTemplate,
      });

      res.json({ success: true, user: authUser.user });
    } catch (error: any) {
      console.error("Error adding user:", error);
      if (!res.headersSent) {
        res.status(500).json({ 
          success: false, 
          error: error.message || "Failed to create user and send email" 
        });
      }
    }
  });

  // Global error handler for JSON
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      error: "An unexpected server error occurred"
    });
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
