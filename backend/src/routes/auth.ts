import { Router, Request, Response } from "express";
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
router.get("/microsoft", async (req: Request, res: Response) => {
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
router.get("/microsoft/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      console.error("OAuth error:", error);
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?error=${encodeURIComponent(
          error as string
        )}`
      );
    }

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth/error?error=missing_code`
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
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.photos?.[0]?.value,
        })
        .returning();
      userId = newUser[0].id;
    } else {
      userId = user[0].id;
      // Update existing user with latest profile info
      await db
        .update(users)
        .set({
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          avatarUrl: profile.photos?.[0]?.value,
          updatedAt: new Date(),
        })
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
        displayName: profile.displayName,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.expiresAt,
        scope: tokens.scope,
      });
    } else {
      // Update existing connection with new tokens
      await db
        .update(calendarConnections)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          tokenExpiresAt: tokens.expiresAt,
          scope: tokens.scope,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(calendarConnections.id, existingConnection[0].id));
    }

    // Generate JWT token
    const authUser: AuthUser = {
      id: userId,
      email: profile.email,
      displayName: profile.displayName,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatarUrl: profile.photos?.[0]?.value,
    };

    const jwt = jwtService.generateToken(authUser);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${jwt}`);
  } catch (error) {
    console.error("Error in Microsoft callback:", error);
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/error?error=callback_failed`
    );
  }
});

/**
 * POST /auth/microsoft/profile
 * Authenticate user with Microsoft Graph profile data from Office Add-in
 */
router.post("/microsoft/profile", async (req: Request, res: Response) => {
  try {
    const { profile } = req.body;

    if (!profile || !profile.email) {
      return res.status(400).json({
        success: false,
        error: "Profile data with email is required",
      } as ApiResponse);
    }

    // Find or create user based on profile data
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
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
        })
        .returning();
      userId = newUser[0].id;
    } else {
      userId = user[0].id;
      // Update existing user with latest profile info
      await db
        .update(users)
        .set({
          displayName: profile.displayName,
          firstName: profile.firstName,
          lastName: profile.lastName,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Generate JWT token
    const authUser: AuthUser = {
      id: userId,
      email: profile.email,
      displayName: profile.displayName || "",
      firstName: profile.firstName,
      lastName: profile.lastName,
    };

    const accessToken = jwtService.generateToken(authUser);
    const refreshToken = jwtService.generateRefreshToken(authUser);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: authUser,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Error in Microsoft profile auth:", error);
    res.status(500).json({
      success: false,
      error: "Authentication failed",
    } as ApiResponse);
  }
});

/**
 * POST /auth/refresh
 * Refresh JWT token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: "Refresh token is required",
      } as ApiResponse);
    }

    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
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
      displayName: user[0].displayName || "",
      firstName: user[0].firstName || undefined,
      lastName: user[0].lastName || undefined,
      timeZone: user[0].timeZone || undefined,
      avatarUrl: user[0].avatarUrl || undefined,
    };

    // Generate new tokens
    const newAccessToken = jwtService.generateToken(authUser);
    const newRefreshToken = jwtService.generateRefreshToken(authUser);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: authUser,
      },
    } as ApiResponse);
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(401).json({
      success: false,
      error: "Invalid refresh token",
    } as ApiResponse);
  }
});

/**
 * POST /auth/logout
 * Logout user (invalidate session)
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    // For JWT tokens, we can't invalidate them on the server side
    // The client should remove the token from storage
    // In a more sophisticated setup, you might maintain a blacklist of tokens

    res.json({
      success: true,
      message: "Logged out successfully",
    } as ApiResponse);
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({
      success: false,
      error: "Logout failed",
    } as ApiResponse);
  }
});

/**
 * GET /auth/me
 * Get current user profile
 */
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authorization token required",
      } as ApiResponse);
    }

    const payload = jwtService.verifyToken(token);

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
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
      displayName: user[0].displayName || "",
      firstName: user[0].firstName || undefined,
      lastName: user[0].lastName || undefined,
      timeZone: user[0].timeZone || undefined,
      avatarUrl: user[0].avatarUrl || undefined,
    };

    res.json({
      success: true,
      data: authUser,
    } as ApiResponse<AuthUser>);
  } catch (error) {
    console.error("Error getting user profile:", error);
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    } as ApiResponse);
  }
});

export default router;
