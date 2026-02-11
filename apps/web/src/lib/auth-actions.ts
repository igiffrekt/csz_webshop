'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { AuthError } from 'next-auth'
import { signIn, signOut, auth } from './auth'
import { prisma } from './prisma'

export interface AuthState {
  error?: string
  fieldErrors?: Record<string, string[]>
  success?: boolean
}

const registerSchema = z
  .object({
    username: z.string().min(3, 'A felhaszn\u00e1l\u00f3n\u00e9v legal\u00e1bb 3 karakter'),
    email: z.string().email('\u00c9rv\u00e9nytelen e-mail c\u00edm'),
    password: z.string().min(6, 'A jelsz\u00f3 legal\u00e1bb 6 karakter'),
    passwordConfirm: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional(),
    companyName: z.string().optional(),
    vatNumber: z.string().optional(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'A jelszavak nem egyeznek',
    path: ['passwordConfirm'],
  })

const forgotPasswordSchema = z.object({
  email: z.string().email('\u00c9rv\u00e9nytelen e-mail c\u00edm'),
})

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Hi\u00e1nyzik a vissza\u00e1ll\u00edt\u00e1si k\u00f3d'),
    password: z.string().min(6, 'A jelsz\u00f3 legal\u00e1bb 6 karakter'),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'A jelszavak nem egyeznek',
    path: ['passwordConfirmation'],
  })

const updateProfileSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().max(50).optional(),
  companyName: z.string().max(255).optional(),
  vatNumber: z.string().max(50).optional(),
})

/**
 * Login with email and password
 */
export async function loginAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'E-mail c\u00edm \u00e9s jelsz\u00f3 sz\u00fcks\u00e9ges' }
  }

  const redirectTo = formData.get('redirectTo') as string

  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'Hib\u00e1s e-mail c\u00edm vagy jelsz\u00f3' }
    }
    throw error
  }

  redirect(redirectTo || '/hu')
}

/**
 * Register new account
 */
export async function registerAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = registerSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
    firstName: formData.get('firstName') || undefined,
    lastName: formData.get('lastName') || undefined,
    phone: formData.get('phone') || undefined,
    companyName: formData.get('companyName') || undefined,
    vatNumber: formData.get('vatNumber') || undefined,
  })

  if (!validatedFields.success) {
    return { fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  const { passwordConfirm, password, ...userData } = validatedFields.data

  try {
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: userData.email },
    })
    if (existingEmail) {
      return { error: 'Ez az e-mail c\u00edm m\u00e1r regisztr\u00e1lva van' }
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: userData.username },
    })
    if (existingUsername) {
      return { error: 'Ez a felhaszn\u00e1l\u00f3n\u00e9v m\u00e1r foglalt' }
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.create({
      data: {
        ...userData,
        passwordHash,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return { error: 'Hiba t\u00f6rt\u00e9nt a regisztr\u00e1ci\u00f3 sor\u00e1n. Pr\u00f3b\u00e1ld \u00fajra k\u00e9s\u0151bb.' }
  }

  // Auto sign-in after registration
  const redirectTo = formData.get('redirectTo') as string

  try {
    await signIn('credentials', {
      email: userData.email,
      password,
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      // If auto-login fails, redirect to login
      redirect('/hu/auth/bejelentkezes?registered=true')
    }
    throw error
  }

  redirect(redirectTo || '/hu')
}

/**
 * Logout
 */
export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false })
  redirect('/hu')
}

/**
 * Request password reset
 */
export async function forgotPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = forgotPasswordSchema.safeParse({
    email: formData.get('email'),
  })

  if (!validatedFields.success) {
    return { fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: validatedFields.data.email },
    })

    if (user) {
      // Delete existing tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      })

      // Create new token
      const token = crypto.randomBytes(32).toString('hex')
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      })

      // TODO: Send email with reset link containing token
      console.log(`Password reset token for ${user.email}: ${token}`)
    }
  } catch (error) {
    console.error('Forgot password error:', error)
  }

  // Always return success to prevent email enumeration
  return { success: true }
}

/**
 * Reset password with token
 */
export async function resetPasswordAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const validatedFields = resetPasswordSchema.safeParse({
    token: formData.get('token') || formData.get('code'),
    password: formData.get('password'),
    passwordConfirmation: formData.get('passwordConfirmation'),
  })

  if (!validatedFields.success) {
    return { fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: validatedFields.data.token },
    })

    if (!resetToken || resetToken.expires < new Date()) {
      return { error: '\u00c9rv\u00e9nytelen vagy lej\u00e1rt vissza\u00e1ll\u00edt\u00e1si link' }
    }

    const passwordHash = await bcrypt.hash(validatedFields.data.password, 12)

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    })

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    })
  } catch {
    return { error: 'Hiba t\u00f6rt\u00e9nt. Pr\u00f3b\u00e1ld \u00fajra k\u00e9s\u0151bb.' }
  }

  redirect('/hu/auth/bejelentkezes?reset=success')
}

/**
 * Update user profile
 */
export async function updateProfileAction(
  prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Nincs bejelentkezve' }
  }

  const validatedFields = updateProfileSchema.safeParse({
    firstName: formData.get('firstName') || undefined,
    lastName: formData.get('lastName') || undefined,
    phone: formData.get('phone') || undefined,
    companyName: formData.get('companyName') || undefined,
    vatNumber: formData.get('vatNumber') || undefined,
  })

  if (!validatedFields.success) {
    return { fieldErrors: validatedFields.error.flatten().fieldErrors }
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: validatedFields.data,
    })

    revalidatePath('/[locale]/fiok/profil', 'page')
    return { success: true }
  } catch {
    return { error: 'Hiba t\u00f6rt\u00e9nt a profil friss\u00edt\u00e9se sor\u00e1n. Pr\u00f3b\u00e1ld \u00fajra k\u00e9s\u0151bb.' }
  }
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile() {
  const session = await auth()
  if (!session?.user?.id) {
    return { user: null, error: 'Nincs bejelentkezve' }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        companyName: true,
        vatNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return { user }
  } catch {
    return { user: null, error: 'Hiba t\u00f6rt\u00e9nt' }
  }
}
