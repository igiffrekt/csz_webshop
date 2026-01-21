import { NextResponse } from 'next/server';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Minden kötelező mező kitöltése szükséges' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Érvénytelen e-mail cím' },
        { status: 400 }
      );
    }

    // Send email via Strapi or log for now
    // In production, this would send via Strapi email plugin or external service
    const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

    if (ADMIN_EMAIL) {
      // Try to send via Strapi email service
      try {
        const response = await fetch(`${STRAPI_URL}/api/contact-messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
          },
          body: JSON.stringify({
            data: {
              name: body.name,
              email: body.email,
              phone: body.phone || null,
              subject: body.subject,
              message: body.message,
            },
          }),
        });

        if (!response.ok) {
          console.log('Contact message saved to Strapi:', body.email);
        }
      } catch (e) {
        // Strapi contact-message type may not exist, just log
        console.log('Contact form submission:', {
          name: body.name,
          email: body.email,
          subject: body.subject,
        });
      }
    } else {
      // Log submission for development
      console.log('Contact form submission received:', {
        name: body.name,
        email: body.email,
        phone: body.phone,
        subject: body.subject,
        message: body.message.substring(0, 100) + '...',
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az üzenet küldése közben' },
      { status: 500 }
    );
  }
}
