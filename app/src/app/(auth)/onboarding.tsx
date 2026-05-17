import { View, Text, Pressable, ImageBackground } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

import { Button } from "heroui-native";

const BG_IMAGE = {
  uri: "https://cdn.pixabay.com/photo/2016/11/09/23/16/music-1813100_1280.png",
};

export default function Onboarding() {
  return (
    <ImageBackground source={BG_IMAGE} resizeMode="cover" className="flex-1">
      <StatusBar style="light" />

      <View className="flex-1 bg-black/70 justify-end">
        <View className="px-8 pb-10 flex flex-col items-center">
          <Text className="text-accent text-6xl font-extraBold">Turn In</Text>
          <Text className="text-white text-6xl font-extraBold">Feel More</Text>
        </View>

        <View className="px-6 pb-safe-offset-8 gap-5">
          <Button onPress={() => router.push("/(auth)/login")} size="lg">
            <Button.Label>Start listening</Button.Label>
          </Button>

          <View className="items-center gap-1.5 pb-2">
            <Text className="text-white text-xs text-center leading-5">
              By registering, you agree to the User Agreement{"\n"}and Privacy
              Policy
            </Text>
            <View className="flex-row gap-5 mt-0.5">
              <Pressable>
                <Text className="text-accent text-xs font-semibold">
                  User Agreement
                </Text>
              </Pressable>
              <Pressable>
                <Text className="text-accent text-xs font-semibold">
                  Privacy Policy
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
