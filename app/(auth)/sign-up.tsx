import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser, signInWithGoogle } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [form, setForm] = useState({name: '', email: "", password: ""});
    const { fetchAuthenticatedUser } = useAuthStore();

    const submit = async () => {
        if (!form.name || !form.email || !form.password) return Alert.alert('Error',"Please enter a valid email address & password");

        setIsSubmitting(true);

        try {
            await createUser({
                email: form.email,
                password: form.password,
                name: form.name,
            })
            
            // Update auth store after successful sign up
            await fetchAuthenticatedUser();
            
            // Wait for state to propagate (mobile needs more time)
            setTimeout(() => {
                router.replace('/');
            }, 500);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleGoogleSignUp = async () => {
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            // OAuth will redirect automatically
        } catch (error: any) {
            Alert.alert('Error', error.message);
            setIsGoogleLoading(false);
        }
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your full name"
                value={form.name}
                onChangeText={(text)=> setForm((prev)=> ({...prev, name: text}))}
                label="Full Name"
            />
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
                title="Sign Up"
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
                onPress={handleGoogleSignUp}
                style="bg-white border-2 border-gray-400 shadow-sm"
                textStyle="!text-gray-800"
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">Already have an account?</Text>
                <Link href="/sign-in" className="base-bold text-primary">Sign In</Link>
            </View>
        </View>
    )
}
export default SignUp