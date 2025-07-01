import jwt from "jsonwebtoken";
import { JWTPayload, AuthUser } from "../types";

export class JWTService {
  private secretKey: string | null = null;
  private expiresIn: string | null = null;

  private getSecretKey(): string {
    if (!this.secretKey) {
      const envSecret = process.env.JWT_SECRET_KEY;
      if (!envSecret) {
        throw new Error("JWT_SECRET_KEY environment variable is required");
      }
      this.secretKey = envSecret;
    }
    return this.secretKey;
  }

  private getExpiresIn(): string {
    if (!this.expiresIn) {
      this.expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    }
    return this.expiresIn;
  }

  /**
   * Generate JWT token for user
   */
  generateToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.getSecretKey(), {
      expiresIn: this.getExpiresIn(),
      issuer: "whattime-api",
      audience: "whattime-client",
    });
  }

  /**
   * Verify and decode JWT token
   */
  verifyToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecretKey(), {
        issuer: "whattime-api",
        audience: "whattime-client",
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Token has expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Extract token from Authorization header
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1];
  }

  /**
   * Generate refresh token (longer expiration)
   */
  generateRefreshToken(user: AuthUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, this.getSecretKey(), {
      expiresIn: "30d", // Refresh tokens last longer
      issuer: "whattime-api",
      audience: "whattime-refresh",
    });
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.getSecretKey(), {
        issuer: "whattime-api",
        audience: "whattime-refresh",
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error("Refresh token has expired");
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid refresh token");
      } else {
        throw new Error("Refresh token verification failed");
      }
    }
  }
}

export const jwtService = new JWTService();
