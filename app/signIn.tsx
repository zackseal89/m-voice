import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { signInWithEmail, signUpWithEmail } from '../src/services/authService'; // Adjust path as necessary

// This is the UI for your sign-in screen.
// It uses the authService functions for sign-in and sign-up.
const SignInScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login or Sign Up</Text>
      <View style={styles.buttonContainer}>
        <Button title="Sign In (test@test.com)" onPress={() => signInWithEmail('test@test.com', 'password')} />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Sign Up (test@test.com)" onPress={() => signUpWithEmail('test@test.com', 'password')} />
      </View>
      {/* You can add input fields for email/password and proper forms here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    marginVertical: 5, // Add some space between buttons
    width: '80%', // Make buttons a bit wider
  }
});

export default SignInScreen;
