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

  async signInWithPassword(params: SignInWithPasswordParams): Promise<{ error?: string }> {
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
      return { error: err.message, personData: null};
  }

    const token = generateToken();
    localStorage.setItem('custom-auth-token', token);

    return {};
  }

  async resetPassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Password reset not implemented' };
  }

  async updatePassword(_: ResetPasswordParams): Promise<{ error?: string }> {
    return { error: 'Update reset not implemented' };
  }

  async getUser(): Promise<{ data?: User | null; error?: string }> {
    // Make API request
    //Validate the token and get the user data
    console.log('Validating token in getUser() ');
    const cookies = Cookies.get();
    if(cookies.jwt){
        try{
            console.log(cookies.jwt);
            //Todo, bring all user information from the token
            const res = await verifyToken(cookies.jwt);
            if(res.data){
                console.log('Token is valid');
                return { data: res.data };
            }else{
                console.log('Token is not valid - no data in the response');
                return { data: null };
            }
        }catch(error){
            console.log('Token is not valid in catch');
            return { data: null };
        }
    }else{
        console.log('Token is not valid in validating jwt');
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
