import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Button, TextField, Input, Label, FieldError } from "heroui-native";
import { useAuthStore } from "@/store/auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const login = useAuthStore((s) => s.login);

  const clearError = () => setError("");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    clearError();
    await new Promise((r) => setTimeout(r, 700));

    const success = login(email, password);
    if (success) {
      router.replace("/(app)");
    } else {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(process.env.EXPO_PUBLIC_TEST_EMAIL ?? "");
    setPassword(process.env.EXPO_PUBLIC_TEST_PASSWORD ?? "");
    clearError();
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            onPress={() => router.back()}
            className="px-6 pt-safe-offset-2 pb-2"
          >
            <Text className="text-accent text-base font-semibold">Back</Text>
          </Pressable>

          <View className="flex-1 px-6 justify-center py-6">
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-full bg-accent items-center justify-center mb-5">
                <Text style={{ fontSize: 38 }}>🎵</Text>
              </View>
              <Text className="text-foreground text-3xl text-center font-extraBold">
                Welcome Back
              </Text>
              <Text className="text-muted text-sm text-center mt-2 font-regular">
                Sign in to continue listening
              </Text>
            </View>

            <View className="gap-4">
              <TextField isRequired isInvalid={!!error}>
                <Label>Email</Label>
                <Input
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearError();
                  }}
                />
              </TextField>

              <TextField isRequired isInvalid={!!error}>
                <Label>Password</Label>
                <View className="w-full flex-row items-center">
                  <Input
                    className="flex-1"
                    placeholder="Enter password"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError();
                    }}
                  />
                  <Pressable
                    className="absolute right-4"
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {showPassword ? "🙈" : "👁️"}
                    </Text>
                  </Pressable>
                </View>
                {error ? <FieldError>{error}</FieldError> : null}
              </TextField>

              <Button
                size="lg"
                variant="primary"
                onPress={handleLogin}
                isDisabled={loading}
                className="mt-2"
              >
                <Button.Label>
                  {loading ? "Signing in…" : "Sign In"}
                </Button.Label>
              </Button>
            </View>

            <Button
              variant="outline"
              onPress={fillTestCredentials}
              className="mt-8 mb-safe-offset-6"
            >
              <Button.Label className="text-muted text-xs text-center">
                Test Credentials - Tap to fill{"\n"}
                {process.env.EXPO_PUBLIC_TEST_EMAIL}
              </Button.Label>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
