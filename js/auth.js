/* ==========================================================================
   TaxNova - Authentication & JWT Simulator Module
   ========================================================================== */

class AuthManager {
  static JWT_SECRET = "taxnova_hyper_secure_jwt_secret_2026";
  static TOKEN_KEY = "taxnova_jwt_token";
  static USER_KEY = "taxnova_current_user";
  static PENDING_OTP_KEY = "taxnova_pending_otp";

  // Simulate Base64URL encode
  static base64UrlEncode(str) {
    return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  // Simulate JWT Token creation (Header.Payload.Signature)
  static generateJWT(user) {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.fullName,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hour expiry
    };

    const encodedHeader = AuthManager.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = AuthManager.base64UrlEncode(JSON.stringify(payload));
    const signature = AuthManager.base64UrlEncode(`sig_${user.id}_${Date.now()}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Parse JWT Token
  static parseJWT(token) {
    if (!token) return null;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payloadStr = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(payloadStr);
    } catch (e) {
      return null;
    }
  }

  // Get active current user session
  static getCurrentUser() {
    const token = localStorage.getItem(AuthManager.TOKEN_KEY);
    if (!token) return null;

    const parsed = AuthManager.parseJWT(token);
    if (!parsed || parsed.exp < (Date.now() / 1000)) {
      AuthManager.logout();
      return null;
    }
    
    return DataStore.get("userProfile");
  }

  // Sign Up Flow
  static signUp(fullName, email, password, businessType) {
    if (!fullName || !email || !password) {
      return { success: false, message: "Please fill in all required fields." };
    }

    const newUser = {
      id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
      fullName,
      email,
      businessName: `${fullName}'s Business`,
      businessType: businessType || "Freelancer",
      taxFilingStatus: "Single",
      state: "California",
      isVerified: false
    };

    // Store pending user & generate mock 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem(AuthManager.PENDING_OTP_KEY, JSON.stringify({
      user: newUser,
      otp: otpCode,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 min
    }));

    return {
      success: true,
      requiresVerification: true,
      otpDemo: otpCode,
      message: `Verification email sent! Demo OTP code: ${otpCode}`
    };
  }

  // Verify Email OTP Code
  static verifyOTP(inputCode) {
    const pendingRaw = sessionStorage.getItem(AuthManager.PENDING_OTP_KEY);
    if (!pendingRaw) {
      return { success: false, message: "No pending verification found. Please sign up again." };
    }

    const pending = JSON.parse(pendingRaw);
    if (Date.now() > pending.expiresAt) {
      return { success: false, message: "OTP code expired. Please request a new one." };
    }

    if (pending.otp !== inputCode.trim()) {
      return { success: false, message: "Invalid OTP code. Please check and try again." };
    }

    // Mark as verified & create session
    const user = pending.user;
    user.isVerified = true;
    DataStore.set("userProfile", user);

    const token = AuthManager.generateJWT(user);
    localStorage.setItem(AuthManager.TOKEN_KEY, token);
    sessionStorage.removeItem(AuthManager.PENDING_OTP_KEY);

    return { success: true, user, token, message: "Email verified successfully! Welcome to TaxNova." };
  }

  // Regular Email/Password Login
  static login(email, password) {
    if (!email || !password) {
      return { success: false, message: "Please enter email and password." };
    }

    let user = DataStore.get("userProfile");
    if (!user || user.email.toLowerCase() !== email.toLowerCase().trim()) {
      // For demo, create or adopt user
      user = {
        id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
        fullName: email.split('@')[0].toUpperCase(),
        email: email.trim(),
        businessName: "Freelance Enterprise",
        businessType: "Freelancer / Solopreneur",
        taxFilingStatus: "Single",
        state: "California",
        isVerified: true
      };
      DataStore.set("userProfile", user);
    }

    const token = AuthManager.generateJWT(user);
    localStorage.setItem(AuthManager.TOKEN_KEY, token);

    return { success: true, user, token, message: "Logged in successfully!" };
  }

  // Google OAuth Simulator
  static loginWithGoogle() {
    const googleUser = {
      id: "usr_google_998877",
      fullName: "Jordan Lee (Google)",
      email: "jordan.lee@gmail.com",
      businessName: "Lee Creative Agency",
      businessType: "Small Business Owner",
      taxFilingStatus: "Single",
      state: "New York",
      isVerified: true
    };

    DataStore.set("userProfile", googleUser);
    const token = AuthManager.generateJWT(googleUser);
    localStorage.setItem(AuthManager.TOKEN_KEY, token);

    return { success: true, user: googleUser, token, message: "Authenticated via Google!" };
  }

  // Forgot Password Link Request
  static requestPasswordReset(email) {
    if (!email) {
      return { success: false, message: "Please enter your registered email address." };
    }
    const resetToken = AuthManager.base64UrlEncode(`reset_${email}_${Date.now()}`);
    return {
      success: true,
      resetToken,
      message: `Password reset link generated! Link: #reset-password?token=${resetToken}`
    };
  }

  // Logout
  static logout() {
    localStorage.removeItem(AuthManager.TOKEN_KEY);
    window.location.reload();
  }
}
