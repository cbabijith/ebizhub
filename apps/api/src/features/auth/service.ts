import { supabase } from "../../config/auth.js";
import { AuthRepository } from "./repository.js";

const authRepo = new AuthRepository();

export class AuthService {
  async register(data: any) {
    // 1. Check if profile already exists in local DB
    const existing = await authRepo.findProfileByEmail(data.email);
    if (existing) {
      throw new Error("Email is already registered");
    }

    // 2. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          phone: data.phone || "",
          role: data.role,
        },
      },
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Failed to create authentication account");
    }

    const userId = authData.user.id;

    try {
      // 3. Create local profile record
      const profile = await authRepo.createProfile({
        id: userId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        role: data.role,
      });

      // 4. Create local member record linked to the profile
      const member = await authRepo.createMember({
        profileId: userId,
      });

      return {
        user: authData.user,
        profile,
        member,
        session: authData.session,
      };
    } catch (dbError: any) {
      // Clean up Supabase user if database sync fails (to avoid orphan users)
      console.error("Local database synchronization failed. Cleaning up Supabase user...", dbError);
      // Wait, we can only delete users if service role key is configured.
      try {
        await supabase.auth.admin.deleteUser(userId);
      } catch (cleanUpErr) {
        console.error("Failed to clean up Supabase user:", cleanUpErr);
      }
      throw new Error(`Registration sync failed: ${dbError.message}`);
    }
  }

  async login(data: any) {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || "Invalid login credentials");
    }

    // 2. Fetch local user profile details
    const profile = await authRepo.findProfileById(authData.user.id);
    if (!profile) {
      throw new Error("Authenticated profile not found in database records");
    }

    if (profile.status !== "active") {
      throw new Error(`Your account is currently ${profile.status}`);
    }

    return {
      session: authData.session,
      user: authData.user,
      profile,
    };
  }

  async logout(token: string) {
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  async refreshSession(refreshToken: string) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async getMe(userId: string) {
    const profile = await authRepo.findProfileById(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  }

  async forgotPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  async resetPassword(password: string) {
    // This expects user is logged in or verification token is set
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  async sendOtp(phone: string) {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    if (error) {
      throw new Error(error.message);
    }
    return true;
  }

  async verifyOtp(phone: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
