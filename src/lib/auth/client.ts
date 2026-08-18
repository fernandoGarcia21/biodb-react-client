'use client';

import type { User } from '@/types/user';
import { userLogin, verifyToken, userLogout } from '@/api/auth';
import Cookies from 'js-cookie';

function generateToken(): string {
  const arr = new Uint8Array(12);
  window.crypto.getRandomValues(arr);
  return Array.from(arr, (v) => v.toString(16).padStart(2, '0')).join('');
}

const user = {
  id: '',
  avatar: '/assets/avatar.png',
  firstName: '',
  lastName: '',
  email: '',
} satisfies User;

export interface SignUpParams {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface SignInWithOAuthParams {
  provider: 'google' | 'discord';
}

export interface SignInWithPasswordParams {
  email: string;
  password: string;
}

export interface ResetPasswordParams {
  email: string;
}

class AuthClient {
  async signUp(_: SignUpParams): Promise<{ error?: string }> {
    // Make API request

    // We do not handle the API, so we'll just generate a token and store it in localStorage.
    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async signInWithOAuth(_: SignInWithOAuthParams): Promise<{ error?: string }> {
    return { error: 'Social authentication not implemented' };
  }

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string; personData: any | null }> {
    const { email, password } = params;

    // Make API request
    try{
      const loginData = {'username': email, 'password': password};
      const res = await userLogin(loginData);
      console.log(res);

      // Update the user object with the returned data
      const person = {
        firstName : res.data.firstName,
        lastName : res.data.familyName,
        email : res.data.email
      }

      return {error: null, personData: person};

    } catch (err){
      console.log(err);
      const errorMessage = err.response?.status === 401 
        ? 'Invalid email or password. Please try again.' 
        : err.message || 'An error occurred during login';
      return { error: errorMessage, personData: null};
    }
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  
  async getUser(): Promise<{ data?: User | null; error?: string }> {
  console.log('Validating token in getUser()');

  try {
    const res = await verifyToken();

    if (res.data) {
      console.log('Token is valid');
      return { data: res.data };
    }

    return { data: null };
  } catch (error) {
    console.log('Token is not valid');
    return { data: null };
  }
}

  async signOut(): Promise<{ error?: string }> {

    try{
      const res = await userLogout();
      console.log(res);
    } catch (err){
      console.log(err);
      return { error: err.message};
  }
    localStorage.removeItem('custom-auth-token');

    return {};
  }
}

export const authClient = new AuthClient();

