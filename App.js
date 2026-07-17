import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
  Animated,
} from "react-native";

const mock = {
  USD: 5.0, // Mock conversion rate for USD
  EUR: 6.0, // Mock conversion rate for EUR
};

export default function App() {
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [quotaMessage, setQuotaMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const triggerAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleConversion = async () => {
    Keyboard.dismiss();

    if (!amount || isNaN(amount)) {
      alert("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setResult(null);

    let convertedValue = 0;
    let rate = 0;
    const key = `${currency}BRL`;

    try {
      const response = await fetch(
        "https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL",
      );
      
      const data = await response.json();

      if (!data || data.status === 429) {
        rate = mock[currency];

        setQuotaMessage("Quota exceeded. The exchange rates used are for reference and may not be up to date.");
      } else {
        rate = parseFloat(data[key].bid);

        setQuotaMessage("");
      }
    } catch (error) {
      rate = mock[currency];

      console.log("DETAILED_ERROR:", error);
      alert(
        `Error fetching exchange rates. Please try again.: ${error.message}`,
      );
    } finally {
      convertedValue = parseFloat(amount) / rate;

      setResult({
        originalAmount: amount,
        targetCurrency: currency,
        total: convertedValue.toFixed(2),
      });
      triggerAnimation();

      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Currency Converter</Text>

      <Text style={styles.label}>Amount in Reais (R$)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 100.50"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Select currency:</Text>
      {quotaMessage ? (
        <Text style={{ color: "red", marginBottom: 10 }}>{quotaMessage}</Text>
      ) : null}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.currencyButton,
            currency === "USD" && styles.activeButton,
          ]}
          onPress={() => setCurrency("USD")}
        >
          <Text
            style={currency === "USD" ? styles.activeText : styles.buttonText}
          >
            Dollar (USD)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.currencyButton,
            currency === "EUR" && styles.activeButton,
          ]}
          onPress={() => setCurrency("EUR")}
        >
          <Text
            style={currency === "EUR" ? styles.activeText : styles.buttonText}
          >
            Euro (EUR)
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.convertButton}
        onPress={handleConversion}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.convertButtonText}>CONVERT</Text>
        )}
      </TouchableOpacity>

      {result && (
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.originalResultText}>
            R$ {result.originalAmount} in {result.targetCurrency} is equal to:
          </Text>
          <Text style={styles.finalResultText}>
            {result.targetCurrency === "USD" ? "$" : "€"} {result.total}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  currencyButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeButton: {
    backgroundColor: "#007BFF",
    borderColor: "#007BFF",
  },
  buttonText: {
    color: "#333",
  },
  activeText: {
    color: "#fff",
    fontWeight: "bold",
  },
  convertButton: {
    backgroundColor: "#28a745",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    height: 55,
    justifyContent: "center",
  },
  convertButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultContainer: {
    marginTop: 30,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  originalResultText: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 5,
  },
  finalResultText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#28a745",
  },
});
