'use client'
import { getRedirectResult, onAuthStateChanged, type User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../service/Firebase";
import { AuthContext } from "./Contexts";
import { createUser, getUser } from "../actions/FirebaseUserApi";
import type { UserType } from "../types/user";


export interface AuthContextType {
  user: User | null;
  userData: UserType | null;
  loading: boolean;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthContextType["user"]>(null);
  const [userData, setUserData] = useState<AuthContextType["userData"]>(null);
  const [loading, setLoading] = useState<AuthContextType["loading"]>(true);

  // Helper function to save user data
  const saveUserToFirestore = async (firebaseUser: User) => {
    try {
      // Check if user already exists in Firestore
      const existingUser = await getUser(firebaseUser.uid);

      if (!existingUser) {
        // Create new user record if it doesn't exist
        const timestamp = Date.now();
        const newUserData: Partial<UserType> = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          emailVerified: firebaseUser.emailVerified,
          name: firebaseUser.displayName || undefined,
          displayName: firebaseUser.displayName || undefined,
          photo: firebaseUser.photoURL || undefined,
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: timestamp,
          updatedAt: timestamp,
          lastLogin: timestamp,
          authProvider: firebaseUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email',
          metadata: {
            creationTime: firebaseUser.metadata.creationTime,
            lastSignInTime: firebaseUser.metadata.lastSignInTime
          }
        };

        await createUser(firebaseUser.uid, newUserData);

        // Fetch the newly created user data
        const newUser = await getUser(firebaseUser.uid);
        setUserData(newUser);
      } else {
        // Update last login time for existing users
        setUserData(existingUser);
      }
    } catch (error) {
      console.error("Error saving user data:", error);
    }
  };

  useEffect(() => {
    // Handle redirect result (for OAuth flows)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          console.log("Google redirect user:", result.user);
          saveUserToFirestore(result.user);
        }
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error("Google Redirect Error:", error.message);
        } else {
          console.error("Unknown Error:", error);
        }
      });

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth State Changed:", firebaseUser);
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Get or create user in Firestore
          const userDoc = await getUser(firebaseUser.uid);

          if (userDoc) {
            setUserData(userDoc);
          } else {
            await saveUserToFirestore(firebaseUser);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

