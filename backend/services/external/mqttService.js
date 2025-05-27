import mqtt from "mqtt";
import ingestionService from "../data/ingestionService.js";

class MQTTService {
  constructor() {
    // Add more robust connection options
    this.client = mqtt.connect("mqtt://10.10.2.64:1883", {
      clientId: `tagcly_backend_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      queueQoSZero: false,
    });

    this.client.on("connect", () => {
      console.log("Connected to MQTT broker");
      this.client.subscribe("tagcly/pet/+/sensors", { qos: 1 }, (err) => {
        if (!err) {
          console.log("Subscribed to tagcly/pet/+/sensors");
        } else {
          console.error("Subscription error:", err);
        }
      });
    });

    this.client.on("message", async (topic, message) => {
      try {
        // Log raw message for debugging
        const rawMessage = message.toString();
        console.log(`Raw MQTT message from ${topic}:`, rawMessage);
        console.log(`Message length: ${rawMessage.length} bytes`);

        // Check if message is empty or too short
        if (!rawMessage || rawMessage.length < 10) {
          console.error("Received empty or too short message");
          return;
        }

        // Check for common JSON issues
        if (!rawMessage.startsWith("{") || !rawMessage.endsWith("}")) {
          console.error("Message doesn't appear to be valid JSON format");
          console.error("First 50 chars:", rawMessage.substring(0, 50));
          console.error(
            "Last 50 chars:",
            rawMessage.substring(rawMessage.length - 50)
          );
          return;
        }

        // Attempt to parse JSON with additional error context
        let data;
        try {
          data = JSON.parse(rawMessage);
        } catch (parseError) {
          console.error("JSON Parse Error Details:");
          console.error("- Error message:", parseError.message);
          console.error("- Raw message:", rawMessage);
          console.error("- Message bytes:", Buffer.from(rawMessage));

          // Try to identify where the JSON becomes invalid
          this.analyzeJsonError(rawMessage, parseError);
          return;
        }

        // Validate that we have the expected data structure
        if (!data || typeof data !== "object") {
          console.error("Parsed data is not a valid object:", data);
          return;
        }

        // Process the valid data
        await ingestionService.ingestSensorData(data);
        console.log(`Successfully processed MQTT message from ${topic}`);
      } catch (error) {
        console.error("Error processing MQTT message:", error);
        console.error("Stack trace:", error.stack);
      }
    });

    this.client.on("error", (error) => {
      console.error("MQTT connection error:", error);
    });

    this.client.on("close", () => {
      console.log("MQTT connection closed");
    });

    this.client.on("reconnect", () => {
      console.log("MQTT reconnecting...");
    });

    this.client.on("offline", () => {
      console.log("MQTT client offline");
    });
  }

  // Helper method to analyze JSON parsing errors
  analyzeJsonError(jsonString, error) {
    console.log("Analyzing JSON error...");

    // Check for common issues
    const issues = [];

    // Check for unescaped quotes
    const unescapedQuotes = jsonString.match(/[^\\]"/g);
    if (unescapedQuotes && unescapedQuotes.length % 2 !== 0) {
      issues.push("Possible unescaped quotes detected");
    }

    // Check for trailing commas
    if (jsonString.includes(",}") || jsonString.includes(",]")) {
      issues.push("Trailing commas detected");
    }

    // Check for control characters
    const controlChars = jsonString.match(/[\x00-\x1F]/g);
    if (controlChars) {
      issues.push(
        `Control characters detected: ${controlChars
          .map((c) => c.charCodeAt(0))
          .join(", ")}`
      );
    }

    // Check bracket/brace balance
    const openBraces = (jsonString.match(/\{/g) || []).length;
    const closeBraces = (jsonString.match(/\}/g) || []).length;
    const openBrackets = (jsonString.match(/\[/g) || []).length;
    const closeBrackets = (jsonString.match(/\]/g) || []).length;

    if (openBraces !== closeBraces) {
      issues.push(
        `Unbalanced braces: ${openBraces} open, ${closeBraces} close`
      );
    }
    if (openBrackets !== closeBrackets) {
      issues.push(
        `Unbalanced brackets: ${openBrackets} open, ${closeBrackets} close`
      );
    }

    if (issues.length > 0) {
      console.error("Potential JSON issues found:");
      issues.forEach((issue) => console.error(`- ${issue}`));
    }

    // Try to find the approximate location of the error
    if (error.message.includes("position")) {
      const position = error.message.match(/position (\d+)/);
      if (position) {
        const pos = parseInt(position[1]);
        const start = Math.max(0, pos - 20);
        const end = Math.min(jsonString.length, pos + 20);
        console.error(`Context around error position ${pos}:`);
        console.error(`"${jsonString.substring(start, end)}"`);
        console.error(" ".repeat(pos - start) + "^");
      }
    }
  }

  // Method to publish test messages
  publishTestMessage(petId = "PET123") {
    const testMessage = {
      timestamp: new Date().toISOString(),
      pet_id: petId,
      device_id: "ESP32_001",
      temperature: 38.5,
      heart_rate: 80,
      steps: 50,
      activity_intensity: 4.2,
      latitude: 40.7128,
      longitude: -74.006,
      vocalization: "bark",
      loudness: 70,
      status: "ok",
    };

    const topic = `tagcly/pet/${petId}/sensors`;
    this.client.publish(
      topic,
      JSON.stringify(testMessage),
      { qos: 1 },
      (err) => {
        if (err) {
          console.error("Failed to publish test message:", err);
        } else {
          console.log("Test message published successfully");
        }
      }
    );
  }

  // Graceful shutdown
  close() {
    if (this.client) {
      this.client.end();
    }
  }
}

export default new MQTTService();
