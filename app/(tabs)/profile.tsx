import CustomButton from '@/components/CustomButton'
import { logout } from '@/lib/appwrite'
import useAuthStore from '@/store/auth.store'
import { router } from 'expo-router'
import React, { useState } from 'react'
import { Alert, Image, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
    const {user, setIsAuthenticated, setUser} = useAuthStore();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setIsAuthenticated(false);
            setUser(null);
            router.replace('/sign-in');
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-5 pt-5">
                {/* Header */}
                <Text className="h1 text-black">Profile</Text>

                {/* User Info Card */}
                <View className="mt-8 bg-gray-50 rounded-2xl p-6">
                    {/* Avatar */}
                    <View className="items-center mb-6">
                        <Image 
                            source={{uri: user?.avatar}} 
                            className="size-24 rounded-full bg-primary"
                            resizeMode="contain"
                        />
                    </View>

                    {/* User Details */}
                    <View className="gap-4">
                        <View>
                            <Text className="small-regular text-gray-400 mb-1">Name</Text>
                            <Text className="base-semibold text-black">{user?.name || 'N/A'}</Text>
                        </View>

                        <View>
                            <Text className="small-regular text-gray-400 mb-1">Email</Text>
                            <Text className="base-semibold text-black">{user?.email || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <View className="mt-8">
                    <CustomButton
                        title="Logout"
                        onPress={handleLogout}
                        isLoading={isLoggingOut}
                        style="bg-red-500"
                    />
                </View>
            </View>
        </SafeAreaView>
    )
}
export default Profile
