import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated } from 'react-native';

const BoxBreathing = () => {
  const [squareSize, setSquareSize] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(squareSize, {
          toValue: 150,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(squareSize, {
          toValue: 50,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  square: {
    backgroundColor: 'blue',
  },
});

export default BoxBreathing;
