import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocFromServer 
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);

// CRITICAL: The app will break without specifying firestoreDatabaseId!
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Google Auth Provider setup (default popup authorization)
export const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// FIRESTORE CRUD OPERATIONS FOR PROJECTS AND BYOK CONNECTORS
// -------------------------------------------------------------

export async function saveProjectToFirestore(projectId: string, project: any) {
  try {
    const docRef = doc(db, "projects", projectId);
    await setDoc(docRef, project);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `projects/${projectId}`);
  }
}

export async function loadProjectsFromFirestore(userId: string) {
  try {
    const q = query(
      collection(db, "projects"),
      where("ownerId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const projects: any[] = [];
    querySnapshot.forEach((doc) => {
      projects.push(doc.data());
    });
    // Sort descending by timestamp
    projects.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return projects;
  } catch (error) {
    console.warn("Could not load projects from Firestore, falling back to local state:", error);
    return [];
  }
}

export async function deleteProjectFromFirestore(projectId: string) {
  try {
    const docRef = doc(db, "projects", projectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn("Could not delete project from Firestore:", error);
  }
}

export async function saveConnectorsToFirestore(userId: string, data: { selectedModelId: string; connectors: any[] }) {
  try {
    const docRef = doc(db, "users", userId, "private", "connectors");
    await setDoc(docRef, {
      ...data,
      ownerId: userId
    });
  } catch (error) {
    console.warn("Could not save connectors to Firestore:", error);
  }
}

export async function loadConnectorsFromFirestore(userId: string) {
  try {
    const docRef = doc(db, "users", userId, "private", "connectors");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn("Could not load connectors from Firestore:", error);
    return null;
  }
}
