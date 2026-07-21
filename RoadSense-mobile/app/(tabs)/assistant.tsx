import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AIChip from "../../src/components/AIChip";
import ChatBubble from "../../src/components/ChatBubble";
import GlassCard from "../../src/components/GlassCard";
import { spacing } from "../../src/constants/theme";
import { askRoadSenseAI, cancelGeminiRequest } from "../../src/services/aiService";
import { storageService } from "../../src/services/storageService";
import { useTheme } from "../../src/theme/hooks/useTheme";
import { ChatMessage } from "../../src/types/chat";

const prompts = [
  "Safest route home avoiding highways",
  "Traffic on my commute",
  "Find fuel station nearby",
  "Should I leave now or wait",
  "Weather impact on my trip"
];

const welcome: ChatMessage = {
  id: "welcome",
  role: "assistant",
  createdAt: Date.now(),
  content: "Hi! I'm your RoadSense AI co-pilot. I can help with route planning, traffic information, weather impact, fuel savings, and travel recommendations."
};

export default function AssistantScreen() {
  const { theme } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    storageService.clearChatHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => () => cancelGeminiRequest("assistant"), []);

  async function send(text = input) {
    if (!text.trim() || loading) return;
    const userMessage: ChatMessage = { id: `${Date.now()}-u`, role: "user", content: text.trim(), createdAt: Date.now() };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await askRoadSenseAI(text.trim());
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", content: response, createdAt: Date.now() }]);
    } catch (error) {
      setMessages((current) => [...current, { id: `${Date.now()}-e`, role: "assistant", content: error instanceof Error ? error.message : "AI Co-Pilot is unavailable.", createdAt: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="robot-happy-outline" size={28} color={theme.primary} />
        <View>
          <Text style={[styles.title, { color: theme.text }]}>AI Co-Pilot</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Conversational navigation and trip assistance</Text>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          {prompts.map((prompt) => <AIChip key={prompt} label={prompt} onPress={() => send(prompt)} />)}
        </ScrollView>
        {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
        {loading ? <ActivityIndicator color={theme.primary} style={styles.typing} /> : null}
      </ScrollView>
      <GlassCard style={styles.inputBar}>
        <MaterialCommunityIcons name="microphone-outline" size={22} color={theme.textSecondary} />
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything about your trip..."
          placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }]}
          multiline
        />
        <Pressable onPress={() => send()} disabled={loading} style={[styles.send, { backgroundColor: theme.secondary }, loading && styles.sendDisabled]}>
          <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { alignItems: "center", flexDirection: "row", gap: 12, padding: spacing.screen, paddingTop: 38 },
  title: { fontSize: 28, fontWeight: "900" },
  subtitle: { fontSize: 12, marginTop: 3 },
  messages: { padding: spacing.screen, paddingBottom: 170 },
  chips: { marginBottom: 18 },
  typing: { alignSelf: "flex-start", marginLeft: 18 },
  inputBar: { alignItems: "center", bottom: 104, flexDirection: "row", gap: 10, left: 18, padding: 10, position: "absolute", right: 18 },
  input: { flex: 1, maxHeight: 90, minHeight: 42 },
  send: { alignItems: "center", borderRadius: 16, height: 42, justifyContent: "center", width: 42 },
  sendDisabled: { opacity: 0.62 }
});
