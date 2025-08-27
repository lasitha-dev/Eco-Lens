import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(50)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineSlide = useRef(new Animated.Value(30)).current;
  const illustrationOpacity = useRef(new Animated.Value(0)).current;
  const illustrationScale = useRef(new Animated.Value(0.5)).current;
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Floating elements for background
  const floatingElements = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // Particle animations
  const particles = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Background animation
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();

    // Logo entrance animation with rotation
    Animated.sequence([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 1.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(logoScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Text animation with stagger
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(taglineOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(taglineSlide, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Illustration animation
    Animated.sequence([
      Animated.delay(1000),
      Animated.parallel([
        Animated.timing(illustrationOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(illustrationScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Floating elements animation with different patterns
    floatingElements.forEach((element, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(element, {
            toValue: 1,
            duration: 4000 + index * 300,
            useNativeDriver: true,
          }),
          Animated.timing(element, {
            toValue: 0,
            duration: 4000 + index * 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Particle animations
    particles.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.timing(particle, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(particle, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Navigate to welcome screen after 5 seconds
    setTimeout(() => {
      navigation.replace('Welcome');
    }, 5000);
  };

  // Logo rotation interpolation
  const logoRotate = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      
      {/* Animated Background */}
      <View style={styles.backgroundContainer}>
        <Animated.View 
          style={[
            styles.backgroundGradient,
            {
              opacity: backgroundAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.15],
              }),
            },
          ]}
        />
        
        {/* Animated Particles */}
        {particles.map((particle, index) => (
          <Animated.View 
            key={`particle-${index}`}
            style={[
              styles.particle,
              {
                left: (index % 4) * width * 0.25,
                top: Math.floor(index / 4) * height * 0.3 + 100,
                opacity: particle,
                transform: [{
                  scale: particle.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                }],
              },
            ]}
          />
        ))}
        
        {/* Floating Elements */}
        {floatingElements.map((element, index) => (
          <Animated.View 
            key={`floating-${index}`}
            style={[
              styles.floatingElement,
              {
                width: 40 + index * 10,
                height: 40 + index * 10,
                left: (index % 3) * width * 0.3 + 20,
                top: Math.floor(index / 3) * height * 0.4 + 50,
                opacity: element.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.1, 0.4],
                }),
                transform: [{
                  translateY: element.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20 - index * 5],
                  }),
                }, {
                  rotate: element.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                }],
              },
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [
                  { scale: Animated.multiply(logoScale, pulseAnim) },
                  { rotate: logoRotate },
                ],
              },
            ]}
          >
            <View style={styles.logoCircle}>
              <View style={styles.logoInnerCircle}>
                <Text style={styles.logo}>🌱</Text>
              </View>
              <View style={styles.logoGlow} />
            </View>
          </Animated.View>
          
          <Animated.View
            style={[
              styles.textContainer,
              {
                opacity: textOpacity,
                transform: [{ translateY: textSlide }],
              },
            ]}
          >
            <Text style={styles.appName}>Eco-Lens</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.taglineContainer,
              {
                opacity: taglineOpacity,
                transform: [{ translateY: taglineSlide }],
              },
            ]}
          >
            <Text style={styles.tagline}>Sustainable Shopping Assistant</Text>
          </Animated.View>
        </View>

        {/* Enhanced Illustration Section */}
        <Animated.View
          style={[
            styles.illustrationSection,
            {
              opacity: illustrationOpacity,
              transform: [{ scale: illustrationScale }],
            },
          ]}
        >
          <View style={styles.illustrationContainer}>
            {/* Enhanced eco-themed illustration */}
            <View style={styles.sceneContainer}>
              {/* Person with more detail */}
              <View style={styles.person}>
                <View style={styles.personHead}>
                  <View style={styles.personHair} />
                </View>
                <View style={styles.personBody}>
                  <View style={styles.personShirt} />
                  <View style={styles.personPants} />
                </View>
                <View style={styles.personArm} />
                <View style={styles.personLegs}>
                  <View style={styles.leg1} />
                  <View style={styles.leg2} />
                </View>
              </View>
              
              {/* Enhanced plant being held */}
              <View style={styles.plantInHand}>
                <View style={styles.plantStem} />
                <View style={styles.plantLeaves}>
                  <View style={styles.leaf1} />
                  <View style={styles.leaf2} />
                  <View style={styles.leaf3} />
                  <View style={styles.leaf4} />
                </View>
                <View style={styles.plantFlower}>
                  <View style={styles.petal1} />
                  <View style={styles.petal2} />
                  <View style={styles.petal3} />
                </View>
              </View>
              
              {/* Enhanced soil with more texture */}
              <View style={styles.soil}>
                <View style={styles.soilMound} />
                <View style={styles.soilSpecks}>
                  {[...Array(8)].map((_, i) => (
                    <View key={i} style={[styles.speck, { 
                      left: i * 5, 
                      top: (i % 3) * 4,
                      width: 2 + (i % 3),
                      height: 2 + (i % 3),
                    }]} />
                  ))}
                </View>
              </View>
              
              {/* Enhanced watering can */}
              <View style={styles.wateringCan}>
                <View style={styles.canBody}>
                  <View style={styles.canHandle} />
                  <View style={styles.canSpout} />
                  <View style={styles.canWater} />
                </View>
              </View>
              
              {/* Enhanced potted plants with variety */}
              <View style={styles.pottedPlants}>
                <View style={styles.pot1}>
                  <View style={styles.potBody} />
                  <View style={styles.potPlant1} />
                </View>
                <View style={styles.pot2}>
                  <View style={styles.potBody} />
                  <View style={styles.potPlant2} />
                </View>
                <View style={styles.pot3}>
                  <View style={styles.potBody} />
                  <View style={styles.potPlant3} />
                </View>
              </View>

              {/* Sun rays */}
              <View style={styles.sunRays}>
                {[...Array(8)].map((_, i) => (
                  <View 
                    key={i} 
                    style={[
                      styles.ray, 
                      { 
                        transform: [{ rotate: `${i * 45}deg` }],
                        left: 50,
                        top: 20,
                      }
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1B5E20',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: height * 0.08,
  },
  logoSection: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    position: 'relative',
  },
  logoInnerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
    zIndex: -1,
  },
  logo: {
    fontSize: 70,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    letterSpacing: 2,
  },
  taglineContainer: {
    alignItems: 'center',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    fontWeight: '500',
  },
  illustrationSection: {
    alignItems: 'center',
  },
  illustrationContainer: {
    width: width * 0.85,
    height: height * 0.35,
    position: 'relative',
  },
  sceneContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  person: {
    position: 'absolute',
    left: 25,
    bottom: 50,
  },
  personHead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8D6E63',
    marginBottom: 5,
    position: 'relative',
  },
  personHair: {
    width: 28,
    height: 8,
    backgroundColor: '#5D4037',
    borderRadius: 4,
    position: 'absolute',
    top: -2,
    left: -2,
  },
  personBody: {
    width: 35,
    height: 45,
    backgroundColor: '#5D4037',
    borderRadius: 18,
    position: 'relative',
  },
  personShirt: {
    width: 35,
    height: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    position: 'absolute',
    top: 0,
  },
  personPants: {
    width: 35,
    height: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  personArm: {
    position: 'absolute',
    right: -8,
    top: 12,
    width: 30,
    height: 10,
    backgroundColor: '#8D6E63',
    borderRadius: 5,
    transform: [{ rotate: '45deg' }],
  },
  personLegs: {
    position: 'absolute',
    bottom: -15,
    left: 5,
    flexDirection: 'row',
  },
  leg1: {
    width: 8,
    height: 20,
    backgroundColor: '#5D4037',
    borderRadius: 4,
    marginRight: 5,
  },
  leg2: {
    width: 8,
    height: 20,
    backgroundColor: '#5D4037',
    borderRadius: 4,
  },
  plantInHand: {
    position: 'absolute',
    left: 45,
    bottom: 70,
  },
  plantStem: {
    width: 5,
    height: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 2.5,
  },
  plantLeaves: {
    position: 'absolute',
    top: -8,
    left: -10,
  },
  leaf1: {
    width: 14,
    height: 10,
    backgroundColor: '#66BB6A',
    borderRadius: 7,
    transform: [{ rotate: '-30deg' }],
  },
  leaf2: {
    width: 12,
    height: 8,
    backgroundColor: '#66BB6A',
    borderRadius: 6,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
    top: 3,
    right: -3,
  },
  leaf3: {
    width: 10,
    height: 6,
    backgroundColor: '#66BB6A',
    borderRadius: 5,
    transform: [{ rotate: '-15deg' }],
    position: 'absolute',
    top: -4,
    left: 3,
  },
  leaf4: {
    width: 8,
    height: 5,
    backgroundColor: '#66BB6A',
    borderRadius: 4,
    transform: [{ rotate: '60deg' }],
    position: 'absolute',
    top: 1,
    right: 2,
  },
  plantFlower: {
    position: 'absolute',
    top: -15,
    left: -5,
  },
  petal1: {
    width: 8,
    height: 6,
    backgroundColor: '#FFB74D',
    borderRadius: 4,
    transform: [{ rotate: '0deg' }],
  },
  petal2: {
    width: 8,
    height: 6,
    backgroundColor: '#FFB74D',
    borderRadius: 4,
    transform: [{ rotate: '120deg' }],
    position: 'absolute',
    top: 0,
    left: 0,
  },
  petal3: {
    width: 8,
    height: 6,
    backgroundColor: '#FFB74D',
    borderRadius: 4,
    transform: [{ rotate: '240deg' }],
    position: 'absolute',
    top: 0,
    left: 0,
  },
  soil: {
    position: 'absolute',
    left: 70,
    bottom: 40,
  },
  soilMound: {
    width: 50,
    height: 18,
    backgroundColor: '#8D6E63',
    borderRadius: 25,
  },
  soilSpecks: {
    position: 'absolute',
    top: 5,
    left: 5,
  },
  speck: {
    position: 'absolute',
    backgroundColor: '#6D4C41',
    borderRadius: 1,
  },
  wateringCan: {
    position: 'absolute',
    left: 100,
    bottom: 45,
  },
  canBody: {
    width: 30,
    height: 25,
    backgroundColor: '#81C784',
    borderRadius: 15,
    position: 'relative',
  },
  canHandle: {
    width: 25,
    height: 6,
    backgroundColor: '#81C784',
    borderRadius: 3,
    position: 'absolute',
    top: 8,
    left: -8,
  },
  canSpout: {
    width: 10,
    height: 18,
    backgroundColor: '#81C784',
    borderRadius: 5,
    position: 'absolute',
    top: -8,
    right: -3,
    transform: [{ rotate: '-30deg' }],
  },
  canWater: {
    width: 6,
    height: 8,
    backgroundColor: '#64B5F6',
    borderRadius: 3,
    position: 'absolute',
    top: -12,
    right: -1,
  },
  pottedPlants: {
    position: 'absolute',
    right: 25,
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  pot1: {
    marginRight: 18,
  },
  pot2: {
    marginRight: 18,
  },
  pot3: {
    marginRight: 0,
  },
  potBody: {
    width: 25,
    height: 18,
    backgroundColor: '#8D6E63',
    borderRadius: 12,
  },
  potPlant1: {
    width: 15,
    height: 25,
    backgroundColor: '#66BB6A',
    borderRadius: 8,
    position: 'absolute',
    top: -20,
    left: 5,
  },
  potPlant2: {
    width: 12,
    height: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    position: 'absolute',
    top: -15,
    left: 6,
  },
  potPlant3: {
    width: 18,
    height: 22,
    backgroundColor: '#81C784',
    borderRadius: 9,
    position: 'absolute',
    top: -18,
    left: 3,
  },
  sunRays: {
    position: 'absolute',
    top: 10,
    right: 20,
  },
  ray: {
    position: 'absolute',
    width: 20,
    height: 3,
    backgroundColor: 'rgba(255, 193, 7, 0.6)',
    borderRadius: 1.5,
  },
});

export default SplashScreen;
