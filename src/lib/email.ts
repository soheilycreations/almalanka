import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP Connection Error:", error);
  } else {
    console.log("SMTP Server is ready to take our messages");
  }
});

export async function sendBookingNotification(booking: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@almalanka.com';
  
  const mailOptions = {
    from: `"AlmaLanka" <info@almalanka.com>`,
    to: adminEmail,
    subject: `New Booking Request: ${booking.customerName} - ${booking.tourName}`,
    html: `
      <div style="font-family: serif; max-width: 600px; margin: auto; border: 1px solid #E5E5E5; padding: 40px;">
        <h2 style="color: #D4A017; font-size: 28px; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">New Reservation Received</h2>
        <p style="font-size: 16px; color: #555;">A new tour reservation has been placed on AlmaLanka.</p>
        <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
        <table style="width: 100%; text-align: left; font-size: 14px; border-collapse: collapse;">
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5; width: 40%;">Customer:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.customerName}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Tour:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5; font-weight: bold; color: #D4A017;">${booking.tourName}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Arrival:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.date}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Departure:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.endDate || 'N/A'}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Adults:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.adults || 0}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Children:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.children || 0}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Email:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.email || 'N/A'}</td></tr>
          <tr><th style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">Phone:</th><td style="padding: 12px 0; border-bottom: 1px solid #F5F5F5;">${booking.phone || 'N/A'}</td></tr>
        </table>
        ${booking.notes ? `
          <div style="margin-top: 20px; background: #FAF9F5; padding: 20px; border-left: 4px solid #D4A017;">
            <p style="margin: 0; font-size: 14px; font-weight: bold; color: #D4A017;">Special Request:</p>
            <p style="margin: 10px 0 0 0; font-style: italic; color: #555;">"${booking.notes}"</p>
          </div>
        ` : ''}
        <p style="margin-top: 30px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://almalanka.com'}/admin/bookings" style="background: #D4A017; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold; border-radius: 2px;">Manage Reservation</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Notification email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

export async function sendLeadNotification(lead: any) {
  const adminEmail = process.env.ADMIN_EMAIL || 'info@almalanka.com';
  
  const mailOptions = {
    from: `"AlmaLanka" <info@almalanka.com>`,
    to: adminEmail,
    subject: `New Inquiry: ${lead.name}`,
    html: `
      <div style="font-family: serif; max-width: 600px; margin: auto; border: 1px solid #E5E5E5; padding: 40px;">
        <h2 style="color: #D4A017; font-size: 28px; border-bottom: 2px solid #D4A017; padding-bottom: 10px;">New Website Inquiry</h2>
        <p style="font-size: 16px; color: #555;">You have received a new message from the contact form.</p>
        <hr style="border: 0; border-top: 1px solid #EEE; margin: 20px 0;" />
        <p><strong>From:</strong> ${lead.name} (${lead.email})</p>
        <p><strong>Interest:</strong> ${lead.interest}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #FAF9F5; padding: 20px; font-style: italic; border-left: 4px solid #D4A017;">"${lead.message}"</p>
        <p style="margin-top: 30px; text-align: center;">
            <a href="mailto:${lead.email}" style="background: #D4A017; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; font-weight: bold; border-radius: 2px;">Reply to Customer</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Lead notification email sent:', info.messageId);
  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}
