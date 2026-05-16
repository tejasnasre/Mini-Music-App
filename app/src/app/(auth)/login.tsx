import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
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
          {/* ── Back — pt-safe so it sits below the status bar ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="px-6 pt-safe-offset-2 pb-2"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-accent text-base font-semibold">← Back</Text>
          </TouchableOpacity>

          <View className="flex-1 px-6 justify-center py-6">
            {/* ── Logo ───────────────────────────────────── */}
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

            {/* ── Form ───────────────────────────────────── */}
            <View className="gap-4">
              {/* Email */}
              <View className="bg-field-background rounded-2xl px-4 pt-3 pb-3">
                <Text
                  className="text-muted text-xs mb-1 font-semibold"
                  style={{ letterSpacing: 1 }}
                >
                  EMAIL
                </Text>
                <TextInput
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    clearError();
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="text-field-foreground text-base font-regular"
                />
              </View>

              {/* Password */}
              <View className="bg-field-background rounded-2xl px-4 pt-3 pb-3">
                <Text
                  className="text-muted text-xs mb-1 font-semibold"
                  style={{ letterSpacing: 1 }}
                >
                  PASSWORD
                </Text>
                <View className="flex-row items-center">
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      clearError();
                    }}
                    placeholder="Enter password"
                    placeholderTextColor="#6B7280"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    className="flex-1 text-field-foreground text-base font-regular"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={{ fontSize: 18 }}>
                      {showPassword ? "🙈" : "👁️"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error */}
              {error ? (
                <View className="bg-field-background rounded-xl px-4 py-3 border border-danger">
                  <Text className="text-danger text-sm font-medium">
                    ⚠️ {error}
                  </Text>
                </View>
              ) : null}

              {/* Sign In */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.85}
                className="bg-accent rounded-2xl py-4 items-center mt-2"
                style={{ opacity: loading ? 0.7 : 1 }}
              >
                <Text className="text-accent-foreground text-base font-bold">
                  {loading ? "Signing in…" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Test credentials — pb-safe-offset-6 clears home indicator ── */}
            <TouchableOpacity
              onPress={fillTestCredentials}
              activeOpacity={0.7}
              className="mt-8 mb-safe-offset-6 bg-field-background rounded-2xl px-5 py-4 border border-border"
            >
              <Text
                className="text-muted text-xs text-center mb-2 font-semibold"
                style={{ letterSpacing: 1 }}
              >
                🧪 TEST CREDENTIALS — tap to fill
              </Text>
              <Text className="text-foreground text-sm text-center font-medium">
                {process.env.EXPO_PUBLIC_TEST_EMAIL}
              </Text>
              <Text className="text-muted text-xs text-center mt-1 font-regular">
                {process.env.EXPO_PUBLIC_TEST_PASSWORD}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
