/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/api/google-oauth.ts
export interface GoogleUser {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface GoogleAuthResponse {
  credential: string;
  select_by?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

export class GoogleOAuthService {
  private static readonly NEXT_PUBLIC_GOOGLE_CLIENT_ID =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  private static isInitialized = false;

  static async initializeGoogleAuth(): Promise<void> {
    if (this.isInitialized || !this.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      return;
    }

    // Load Google Identity Services script
    if (!document.getElementById("google-identity-script")) {
      const script = document.createElement("script");
      script.id = "google-identity-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }

    // Wait for Google library to load
    let attempts = 0;
    while (!window.google?.accounts?.id && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (!window.google?.accounts?.id) {
      throw new Error("Google Identity Services failed to load");
    }

    // Initialize Google OAuth
    window.google.accounts.id.initialize({
      client_id: this.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    this.isInitialized = true;
  }

  static async signInWithGoogle(): Promise<GoogleUser> {
    if (!this.isInitialized) {
      await this.initializeGoogleAuth();
    }

    // The null check for 'window.google.accounts.id' is crucial.
    // TypeScript now knows this object exists within this block.
    if (!window.google?.accounts?.id) {
      throw new Error("Google Identity Services not initialized");
    }

    return new Promise((resolve, reject) => {
      let isResolved = false;

      // Create a hidden container for the Google button
      const container = document.createElement("div");
      container.style.display = "none";
      document.body.appendChild(container);

      const handleCredentialResponse = (response: GoogleAuthResponse) => {
        if (isResolved) return;
        isResolved = true;

        try {
          // Decode the JWT token from Google
          const payload = this.parseJwt(response.credential);

          const googleUser: GoogleUser = {
            googleId: payload.sub,
            email: payload.email,
            firstName: payload.given_name,
            lastName: payload.family_name,
            avatar: payload.picture,
          };

          // Clean up
          document.body.removeChild(container);
          resolve(googleUser);
        } catch {
          document.body.removeChild(container);
          reject(new Error("Failed to parse Google response"));
        }
      };

      // Initialize with callback
      window.google!.accounts.id.initialize({
        client_id: this.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      // Render invisible button and trigger click
      window.google!.accounts.id.renderButton(container, {
        theme: "outline",
        size: "large",
        width: 250,
      });

      // Trigger the sign-in flow
      const button = container.querySelector('[role="button"]') as HTMLElement;
      if (button) {
        button.click();
      } else {
        // Fallback to prompt
        window.google!.accounts.id.prompt();
      }

      // Timeout after 30 seconds
      setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          document.body.removeChild(container);
          reject(new Error("Google sign-in timeout"));
        }
      }, 30000);
    });
  }

  private static parseJwt(token: string): any {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      throw new Error("Failed to parse JWT token");
    }
  }

  static signOut(): Promise<void> {
    return new Promise((resolve) => {
      // Add null checks for window.google
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }
      resolve();
    });
  }
}
