// src/lib/api/auth.ts
import axios from "axios";
import { setAuthSession } from "@/lib/auth/session";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://paxlete.com/api";

export const checkUsername = async (username: string) => {
  try {
    const formData = new FormData();
    formData.append("username", username.trim());

    const { data } = await axios.post(`${API_BASE}/checkusername`, {
  username: username.trim(),
});

    return data;
  } catch (error: any) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Failed to check username availability";
    throw new Error(message);
  }
};

/**
 * Complete signup (step 2)
 * Uses FormData (includes optional image file)
 */

export const signup = async ({
  name,
  email,
  password,
  username,
  image,
}: {
  name: string;
  email: string;
  password: string;
  username: string;
  image?: File;
}) => {
  try {
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("email", email.trim());
    formData.append("password", password);
    formData.append("username", username.trim());

    // ✅ ADD THIS
    formData.append("type", "web");

    if (image) {
      formData.append("image", image);
    }

    const { data } = await axios.post(`${API_BASE}/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    // Auto-save token if present
    const token = data?.token ?? data?.access_token ?? data?.accessToken;
    if (token) {
      setAuthSession(String(token));
    }

    return data;
  } catch (error: any) {
    console.error("Signup API error:", error.response?.data || error);

    let errorMessage = "Signup failed. Please try again.";

    if (error.response?.data) {
      const responseData = error.response.data;

      if (typeof responseData === 'string') {
        errorMessage = responseData;
      } else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.error) {
        errorMessage = responseData.error;
      } else if (responseData.msg) {
        errorMessage = responseData.msg;
      }

      const errorString = JSON.stringify(responseData).toLowerCase();
      if (
        errorString.includes('email already exists') ||
        errorString.includes('email already taken') ||
        errorString.includes('email has already been taken') ||
        errorString.includes('email already registered') ||
        errorString.includes('duplicate email') ||
        errorString.includes('email already in use')
      ) {
        errorMessage = 'Email already exists';
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

// export const signup = async ({
//   name,
//   email,
//   password,
//   username,
//   image,
// }: {
//   name: string;
//   email: string;
//   password: string;
//   username: string;
//   image?: File;
// }) => {
//   try {
//     const formData = new FormData();
//     formData.append("name", name.trim());
//     formData.append("email", email.trim());
//     formData.append("password", password);
//     formData.append("username", username.trim());

//     if (image) {
//       formData.append("image", image);
//     }

//     const { data } = await axios.post(`${API_BASE}/signup`, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     // Auto-save token if present
//     const token = data?.token ?? data?.access_token ?? data?.accessToken;
//     if (token) {
//       setAuthSession(String(token));
//     }

//     return data;
//   } catch (error: any) {
//     console.error("Signup API error:", error.response?.data || error);
    
//     // Extract the error message from the response
//     let errorMessage = "Signup failed. Please try again.";
    
//     if (error.response?.data) {
//       // Handle different response structures
//       const responseData = error.response.data;
      
//       // Check for message in various formats
//       if (typeof responseData === 'string') {
//         errorMessage = responseData;
//       } else if (responseData.message) {
//         errorMessage = responseData.message;
//       } else if (responseData.error) {
//         errorMessage = responseData.error;
//       } else if (responseData.msg) {
//         errorMessage = responseData.msg;
//       }
      
//       // Check for email already exists in any field
//       const errorString = JSON.stringify(responseData).toLowerCase();
//       if (
//         errorString.includes('email already exists') ||
//         errorString.includes('email already taken') ||
//         errorString.includes('email has already been taken') ||
//         errorString.includes('email already registered') ||
//         errorString.includes('duplicate email') ||
//         errorString.includes('email already in use')
//       ) {
//         errorMessage = 'Email already exists';
//       }
//     } else if (error.message) {
//       errorMessage = error.message;
//     }
    
//     throw new Error(errorMessage);
//   }
// };