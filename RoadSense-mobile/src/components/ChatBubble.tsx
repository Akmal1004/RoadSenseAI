import Animated, { FadeInUp } from "react-native-reanimated";
import { StyleSheet, Text } from "react-native";
import { ChatMessage } from "../types/chat";
import { useTheme } from "../theme/hooks/useTheme";

export default function ChatBubble({ message }: { message: ChatMessage }) {
  const { theme } = useTheme();
  const user = message.role === "user";
  return (
    <Animated.View
      entering={FadeInUp.duration(240)}
      style={[
        styles.bubble,
        user
          ? { alignSelf: "flex-end", backgroundColor: theme.secondary }
          : { alignSelf: "flex-start", backgroundColor: theme.input, borderColor: theme.border, borderWidth: 1 }
      ]}
    >
      <Text style={[styles.text, { color: user ? "#FFFFFF" : theme.text }]}>{message.content}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    borderRadius: 22,
    marginBottom: 12,
    maxWidth: "86%",
    padding: 14
  },
  text: {
    fontSize: 14,
    lineHeight: 20
  }
});
