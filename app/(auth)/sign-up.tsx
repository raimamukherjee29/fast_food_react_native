import CustomButton from "@/components/CustomButton";
import CustomInput from "@/components/CustomInput";
import { createUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { Link, router } from "expo-router";
import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            
            // Wait a bit for state to propagate
            setTimeout(() => {
                router.replace('/');
            }, 100);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setIsSubmitting(false);
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

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">Already have an account?</Text>
                <Link href="/sign-in" className="base-bold text-primary">Sign In</Link>
            </View>
        </View>
    )
}
export default SignUp