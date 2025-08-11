// lib/api.ts

import { UserData } from "@/types/interfaces";

export async function uploadAvatar(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch('/api/uploadAvatar', {
      method: 'POST',
      body: formData,
    });
  
    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }
  
    const data = await response.json();
    return data.avatarUrl; // URL del avatar en el servidor
  }
  
  export async function saveUserData(user: Partial<UserData>): Promise<UserData> {
    console.log('user en saveUserData',user)
    const response = await fetch('/api/updateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
  
    if (!response.ok) {
      throw new Error('Error saving user data');
    }  
    const updatedUser = await response.json();
    return updatedUser;
  }