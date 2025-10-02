import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { signIn, signInWithGoogle } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import * as Sentry from "@sentry/react-native";
import { Link, router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [form, setForm] = useState({email: "", password: ""});
    const { fetchAuthenticatedUser } = useAuthStore();

    const submit = async () => {
        if (!form.email || !form.password) return Alert.alert('Error',"Please enter a valid email address & password");

        setIsSubmitting(true);

        try {
            await signIn({
                email: form.email,
                password: form.password,
            })
            
            // Update auth store after successful sign in
            await fetchAuthenticatedUser();
            
            // Wait for state to propagate (mobile needs more time)
            setTimeout(() => {
                router.replace('/');
            }, 500);
        } catch (error: any) {
            Alert.alert('Error', error.message);
            Sentry.captureEvent(error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleGoogleSignIn = async () => {
        console.log('Google Sign In button clicked');
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            console.log('OAuth initiated successfully');
            // OAuth will redirect automatically
        } catch (error: any) {
            console.error('Google Sign In error:', error);
            Alert.alert('Error', error?.message || 'Failed to sign in with Google');
            setIsGoogleLoading(false);
        }
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text)=> setForm((prev)=> ({...prev, email: text}))}
                label="Email"
                keyboardType="email-address"
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text)=> setForm((prev)=> ({...prev, password: text}))}
                label="Password"
                secureTextEntry={true}
            />
            <CustomButton
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex-row items-center gap-3">
                <View className="flex-1 h-[1px] bg-gray-200" />
                <Text className="small-regular text-gray-400">OR</Text>
                <View className="flex-1 h-[1px] bg-gray-200" />
            </View>

            <CustomButton
                title="Continue with Google"
                isLoading={isGoogleLoading}
                onPress={handleGoogleSignIn}
                style="bg-white border-2 border-gray-400 shadow-sm"
                textStyle="!text-gray-800"
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">Don't have an account?</Text>
                <Link href="/sign-up" className="base-bold text-primary">Sign Up</Link>
            </View>
        </View>
    )
}
export default SignIn
