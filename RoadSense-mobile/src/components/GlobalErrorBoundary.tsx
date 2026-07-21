import { Component, ErrorInfo, PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import GradientButton from "./GradientButton";

type State = {
  error: Error | null;
};

export default class GlobalErrorBoundary extends Component<PropsWithChildren, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[RoadSense Startup] Render error caught by boundary", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.root}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>RoadSense recovered from an app error. Restart the screen and try again.</Text>
          <GradientButton label="Try Again" icon="refresh" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    backgroundColor: "#030B18",
    flex: 1,
    justifyContent: "center",
    padding: 24
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center"
  },
  message: {
    color: "#94A3B8",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center"
  }
});
