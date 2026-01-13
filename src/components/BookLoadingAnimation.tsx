import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, Easing} from 'react-native';

const BookLoadingAnimation = () => {
  // Create 8 pages for wave effect
  const pages = useRef(
    Array.from({length: 8}, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Create wave animation - pages flip in sequence
    const createWaveAnimation = () => {
      const pageAnimations = pages.map((page, index) => 
        Animated.sequence([
          Animated.delay(index * 120), // Stagger each page by 120ms (slower)
          Animated.timing(page, {
            toValue: 1,
            duration: 900, // Increased from 600ms to 900ms
            easing: Easing.bezier(0.4, 0.0, 0.2, 1),
            useNativeDriver: true,
          }),
        ])
      );

      return Animated.sequence([
        // Wave forward
        Animated.parallel(pageAnimations),
        Animated.delay(500), // Longer pause
        // Wave backward
        Animated.parallel(
          pages.map((page, index) => 
            Animated.sequence([
              Animated.delay((pages.length - 1 - index) * 100), // Slower backward
              Animated.timing(page, {
                toValue: 0,
                duration: 800, // Increased from 500ms to 800ms
                easing: Easing.bezier(0.4, 0.0, 0.2, 1),
                useNativeDriver: true,
              }),
            ])
          )
        ),
        Animated.delay(600), // Longer pause before loop
      ]);
    };

    const loopAnimation = Animated.loop(createWaveAnimation());
    loopAnimation.start();

    return () => loopAnimation.stop();
  }, []);

  const getPageRotation = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-180deg'],
    });
  };

  const getPageTranslateY = (animatedValue: Animated.Value, index: number) => {
    return animatedValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, -20 - (index * 3), 0],
    });
  };

  const getPageOpacity = (animatedValue: Animated.Value) => {
    return animatedValue.interpolate({
      inputRange: [0, 0.3, 0.7, 1],
      outputRange: [1, 0.8, 0.8, 1],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.book}>
        {/* Book Base */}
        <View style={styles.bookBase} />
        
        {/* Animated Pages - Wave Effect */}
        {pages.map((page, index) => (
          <Animated.View
            key={index}
            style={[
              styles.page,
              {
                zIndex: pages.length - index,
                backgroundColor: `hsl(45, ${70 - index * 5}%, ${95 - index * 3}%)`,
                transform: [
                  {perspective: 2000},
                  {translateY: getPageTranslateY(page, index)},
                  {rotateY: getPageRotation(page)},
                ],
                opacity: getPageOpacity(page),
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  book: {
    width: 160,
    height: 120,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookBase: {
    position: 'absolute',
    width: 160,
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  page: {
    position: 'absolute',
    width: 140,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#d4d4d4',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    left: 10,
    top: 10,
  },
});

export default BookLoadingAnimation;
