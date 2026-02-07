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

    // Log the contact form submission
    // TODO: Integrate email sending service (e.g., Resend, SendGrid)
    console.log('Contact form submission received:', {
      name: body.name,
      email: body.email,
      phone: body.phone,
      subject: body.subject,
      message: body.message.substring(0, 100) + '...',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Hiba történt az üzenet küldése közben' },
      { status: 500 }
    );
  }
}
