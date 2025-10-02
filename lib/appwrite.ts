import { CreateUserPrams, GetMenuParams, SignInParams } from "@/type";
import { Linking } from "react-native";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.raima.cravings",
    databaseId: "68dc4682000f97d36190",
    bucketId: "68de556900232d993294",
    userCollectionId: "user",
    categoriesCollectionId: "categories",
    menuCollectionId: "menu",
    customizationsCollectionId: "customizations",
    menuCustomizationCollectionId: "menu_customizations"
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserPrams) => {
    try {
        // Delete any existing session first
        try {
            await account.deleteSession('current');
        } catch (e) {
            // No active session, continue
        }

        const newAccount = await account.create(ID.unique(), email, password, name)
        if(!newAccount) throw Error;

        // account.create() automatically creates a session, no need to sign in again

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );

    } catch(e) {
        throw new Error(e as string)
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // Delete any existing session first
        try {
            await account.deleteSession('current');
        } catch (e) {
            // No active session, continue
        }

        const session = await account.createEmailPasswordSession(email, password);
    } catch (e) {
        throw new Error(e as string);
    }
}

export const logout = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        throw new Error(e as string);
    }
}

export const signInWithGoogle = async () => {
    try {
        // For web, use OAuth2 with redirect
        // Always use the current origin for proper redirect
        const redirectUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/` 
            : 'http://localhost:8081/';
        
        console.log('Starting Google OAuth with redirect:', redirectUrl);
        
        // createOAuth2Session may return a URL on web that we need to manually redirect to
        const result: any = await account.createOAuth2Session(
            'google' as any,
            redirectUrl,
            redirectUrl,
        );
        
        console.log('OAuth URL created:', result);
        
        // Extract the OAuth URL
        const oauthUrl = typeof result === 'string' ? result : result?.href || result?.toString();
        console.log('Extracted OAuth URL:', oauthUrl);
        
        if (oauthUrl) {
            console.log('Opening OAuth URL with Linking...');
            // Use React Native Linking API (works on web, iOS, and Android)
            await Linking.openURL(oauthUrl);
            console.log('Redirect initiated!');
        } else {
            throw new Error('No OAuth URL returned from Appwrite');
        }
    } catch (e) {
        console.error('Google OAuth error:', e);
        throw new Error(e as string);
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        // If user document doesn't exist (e.g., OAuth login), create it
        if(!currentUser || currentUser.documents.length === 0) {
            console.log('User document not found, creating for OAuth user...');
            const avatarUrl = avatars.getInitialsURL(currentAccount.name);
            
            const newUser = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                ID.unique(),
                { 
                    email: currentAccount.email, 
                    name: currentAccount.name, 
                    accountId: currentAccount.$id, 
                    avatar: avatarUrl 
                }
            );
            
            return newUser;
        }

        return currentUser.documents[0];
    } catch (e) {
        console.log(e);
        throw new Error(e as string);
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        const queries: string[] = [];

        if(category) queries.push(Query.equal('categories', category));
        if(query) queries.push(Query.search('name', query));

        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        )

        return menus.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        throw new Error(e as string);
    }
}
