"use server"

import { cookies } from "next/headers"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import type { NextRequest } from "next/server"

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  organizationId: string
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "basix-schedule-secret-key-change-in-production")

async function createToken(user: AuthUser): Promise<string> {
  return await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET)
    return verified.payload.user as AuthUser
  } catch {
    return null
  }
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = request.cookies.get("auth-token")

  if (!token) return null

  return await verifyToken(token.value)
}

export async function register(
  email: string,
  password: string,
  name: string,
  organizationName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { success: false, error: "Email já cadastrado" }
    }

    // Create organization slug from name
    const slug = organizationName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")

    // Check if organization slug exists
    const existingOrg = await db.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      return { success: false, error: "Nome da organização já existe" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create organization and user in a transaction
    const organization = await db.organization.create({
      data: {
        name: organizationName,
        slug,
      },
    })

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "owner",
        organizationId: organization.id,
      },
    })

    // Create session
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    })

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return { success: false, error: "Erro ao criar conta" }
  }
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Find user with organization
    const user = await db.user.findUnique({
      where: { email },
      include: {
        organization: true,
      },
    })

    if (!user) {
      return { success: false, error: "Credenciais inválidas" }
    }

    // Check if organization is active
    if (!user.organization.active) {
      return { success: false, error: "Organização inativa" }
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return { success: false, error: "Credenciais inválidas" }
    }

    // Create session
    const token = await createToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    })

    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return { success: true }
  } catch (error) {
    console.error("[v0] Login error:", error)
    return { success: false, error: "Erro ao fazer login" }
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")

  if (!token) return null

  return await verifyToken(token.value)
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}
