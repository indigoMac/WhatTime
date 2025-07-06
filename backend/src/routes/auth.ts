import { Router } from "express";
import type { Request, Response } from "express";
import { microsoftAuthService } from "../auth/microsoft";
import { jwtService } from "../auth/jwt";
import { db } from "../database/connection";
import { users, calendarConnections } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { ApiResponse, AuthUser } from "../types";

const router = Router();

/**
 * GET /auth/microsoft
 * Initiate Microsoft OAuth flow
 */
router.get("/microsoft", async (req: any, res: any) => {
  try {
    const state = (req.query.state as string) || "";
    const authUrl = await microsoftAuthService.getAuthUrl(state);

    res.json({
      success: true,
      data: { authUrl },
    } as ApiResponse<{ authUrl: string }>);
  } catch (error) {
    console.error("Error initiating Microsoft auth:", error);
    res.status(500).json({
      success: false,
      error: "Failed to initiate Microsoft authentication",
    } as ApiResponse);
  }
});

/**
 * GET /auth/microsoft/callback
 * Handle Microsoft OAuth callback
 */
router.get("/microsoft/callback", async (req: any, res: any) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("OAuth error:", error);
      return res.redirect(
        `${
          process.env.FRONTEND_URL
        }/auth-callback.html?error=${encodeURIComponent(error as string)}`
      );
    }

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-callback.html?error=missing_code`
      );
    }

    // Exchange code for tokens
    const tokens = await microsoftAuthService.getTokenFromCode(
      code as string,
      state as string
    );

    // Get user profile
    const profile = await microsoftAuthService.getUserProfile(
      tokens.accessToken
    );

    // Find or create user
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    let userId: string;
    if (user.length === 0) {
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          email: profile.email,
          displayName: profile.displayName || null,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          avatarUrl: profile.photos?.[0]?.value || null,
        } as any)
        .returning();
      userId = newUser[0].id;
    } else {
      userId = user[0].id;
      // Update existing user with latest profile info
      await db
        .update(users)
        .set({
          displayName: profile.displayName || null,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          avatarUrl: profile.photos?.[0]?.value || null,
          updatedAt: new Date(),
        } as any)
        .where(eq(users.id, userId));
    }

    // Find or create calendar connection
    const existingConnection = await db
      .select()
      .from(calendarConnections)
      .where(
        and(
          eq(calendarConnections.userId, userId),
          eq(calendarConnections.provider, "microsoft"),
          eq(calendarConnections.providerUserId, profile.id)
        )
      )
      .limit(1);

    if (existingConnection.length === 0) {
      // Create new calendar connection
      await db.insert(calendarConnections).values({
        userId,
        provider: "microsoft",
        providerUserId: profile.id,
        email: profile.email,
        displayName: profile.displayName || null,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken || null,
        tokenExpiresAt: tokens.expiresAt || null,
        scope: tokens.scope || null,
      } as any);
    } else {
      // Update existing connection with new tokens
      await db
        .update(calendarConnections)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
          tokenExpiresAt: tokens.expiresAt || null,
          scope: tokens.scope || null,
          isActive: true,
          updatedAt: new Date(),
        } as any)
        .where(eq(calendarConnections.id, existingConnection[0].id));
    }

    // Generate JWT token
    const authUser: AuthUser = {
      id: userId,
      email: profile.email,
      displayName: profile.displayName || null,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      avatarUrl: profile.photos?.[0]?.value || null,
    };

    const jwt = jwtService.generateToken(authUser);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth-callback.html?token=${jwt}`);
  } catch (error) {
    console.error("Error in Microsoft callback:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth-callback.html?error=callback_failed`
    );
  }
});

/**
 * POST /auth/microsoft/profile
 * Authenticate user with Microsoft Graph profile data from Office Add-in
 */
router.post("/microsoft/profile", async (req: any, res: any) => {
  try {
    console.log(
      "🔍 BACKEND DEBUG: Received request body:",
      JSON.stringify(req.body, null, 2)
    );
    console.log(
      "🔍 BACKEND DEBUG: Request headers:",
      JSON.stringify(req.headers, null, 2)
    );

    const { profile } = req.body;

    console.log(
      "🔍 BACKEND DEBUG: Extracted profile:",
      JSON.stringify(profile, null, 2)
    );
    console.log("🔍 BACKEND DEBUG: Profile type:", typeof profile);
    console.log(
      "🔍 BACKEND DEBUG: Profile keys:",
      profile ? Object.keys(profile) : "null"
    );
    console.log("🔍 BACKEND DEBUG: Profile.email:", profile?.email);
    console.log("🔍 BACKEND DEBUG: Profile exists:", !!profile);
    console.log("🔍 BACKEND DEBUG: Profile.email exists:", !!profile?.email);

    if (!profile || !profile.email) {
      console.log("🔍 BACKEND DEBUG: Validation failed - returning 400");
      return res.status(400).json({
        success: false,
        error: "Profile data with email is required",
      } as ApiResponse);
    }

    console.log(
      "🔍 BACKEND DEBUG: Validation passed, proceeding with user creation/lookup"
    );

    // Find or create user based on profile data
    let user = await db
      .select()
      .from(users)
      .where(eq(users.email, profile.email))
      .limit(1);

    let userId: string;
    if (user.length === 0) {
      console.log("🔍 BACKEND DEBUG: Creating new user");
      // Create new user
      const newUser = await db
        .insert(users)
        .values({
          email: profile.email,
          displayName: profile.displayName || null,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
        } as any)
        .returning();
      userId = newUser[0].id;
    } else {
      console.log("🔍 BACKEND DEBUG: Updating existing user");
      userId = user[0].id;
      // Update existing user with latest profile info
      await db
        .update(users)
        .set({
          displayName: profile.displayName || null,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          updatedAt: new Date(),
        } as any)
        .where(eq(users.id, userId));
    }

    // Create AuthUser object
    const authUser: AuthUser = {
      id: userId,
      email: profile.email,
      displayName: profile.displayName || null,
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      avatarUrl: profile.avatarUrl || null,
    };

    // Generate JWT tokens
    const accessToken = jwtService.generateToken(authUser);
    const refreshToken = jwtService.generateRefreshToken(authUser);

    console.log(
      "🔍 BACKEND DEBUG: Authentication successful, returning tokens"
    );

    res.json({
      success: true,
      data: {
        user: authUser,
        accessToken,
        refreshToken,
      },
    } as ApiResponse<{
      user: AuthUser;
      accessToken: string;
      refreshToken: string;
    }>);
  } catch (error) {
    console.error("🔍 BACKEND DEBUG: Error in Microsoft profile auth:", error);
    res.status(500).json({
      success: false,
      error: "Failed to authenticate with Microsoft profile",
    } as ApiResponse);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
router.post("/refresh", async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      } as ApiResponse);
    }

    // Verify refresh token
    const decoded = jwtService.verifyRefreshToken(refreshToken) as any;
    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid refresh token",
      } as ApiResponse);
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    // Create new tokens
    const authUser: AuthUser = {
      id: user[0].id,
      email: user[0].email,
      displayName: user[0].displayName,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      avatarUrl: user[0].avatarUrl,
    };

    const newAccessToken = jwtService.generateToken(authUser);
    const newRefreshToken = jwtService.generateRefreshToken(authUser);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    } as ApiResponse<{
      accessToken: string;
      refreshToken: string;
    }>);
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({
      success: false,
      error: "Failed to refresh token",
    } as ApiResponse);
  }
});

/**
 * GET /auth/me
 * Get current user information
 */
router.get("/me", async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "Authorization header is required",
      } as ApiResponse);
    }

    const token = authHeader.substring(7);
    const decoded = jwtService.verifyToken(token) as any;

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
      } as ApiResponse);
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      } as ApiResponse);
    }

    const authUser: AuthUser = {
      id: user[0].id,
      email: user[0].email,
      displayName: user[0].displayName,
      firstName: user[0].firstName,
      lastName: user[0].lastName,
      avatarUrl: user[0].avatarUrl,
    };

    res.json({
      success: true,
      data: { user: authUser },
    } as ApiResponse<{ user: AuthUser }>);
  } catch (error) {
    console.error("Error getting user info:", error);
    res.status(401).json({
      success: false,
      error: "Failed to get user information",
    } as ApiResponse);
  }
});

export default router;
