/**
 * Onboarding Survey Screen
 * Collects user preferences to personalize their dashboard experience
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../hooks/useAuthLogin';
import { SURVEY_QUESTIONS, SURVEY_CONFIG } from '../constants/surveyQuestions';
import theme from '../styles/theme';
import globalStyles from '../styles/globalStyles';
import { API_BASE_URL } from '../config/api';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const OnboardingSurvey = ({ navigation }) => {
  const { user, auth } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    
    // Debug: Log auth information
    console.log('Survey Screen - User:', user?.email);
    console.log('Survey Screen - Auth token:', auth ? 'Present' : 'Missing');
  }, [user, auth]);

  const handleAnswerSelect = (questionId, answer) => {
    const question = SURVEY_QUESTIONS.find(q => q.id === questionId);
    
    if (question.type === 'multi-select') {
      const currentAnswers = answers[questionId] || [];
      const isSelected = currentAnswers.includes(answer);
      
      let newAnswers;
      if (isSelected) {
        newAnswers = currentAnswers.filter(a => a !== answer);
      } else {
        if (currentAnswers.length < (question.maxSelections || 5)) {
          newAnswers = [...currentAnswers, answer];
        } else {
          Alert.alert('Maximum selections reached', `You can select up to ${question.maxSelections || 5} options.`);
          return;
        }
      }
      
      setAnswers(prev => ({
        ...prev,
        [questionId]: newAnswers
      }));
    } else {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }
  };

  const handleNext = () => {
    const question = SURVEY_QUESTIONS[currentQuestion];
    const answer = answers[question.id];
    
    if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      Alert.alert('Required Question', 'Please select an answer before continuing.');
      return;
    }

    if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSkip = () => {
    if (currentQuestion < SURVEY_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSkipSurvey();
    }
  };

  const handleSkipSurvey = async () => {
    Alert.alert(
      'Skip Survey',
      'Are you sure you want to skip the survey? You can always complete it later from your profile settings.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Skip Survey',
          style: 'destructive',
          onPress: async () => {
            // Mark survey as skipped in local storage
            try {
              await AsyncStorage.setItem('@eco_lens_survey_skipped', 'true');
            } catch (error) {
              console.error('Error saving skip status:', error);
            }
            // Navigate directly to dashboard without submitting survey
            navigation.navigate('Dashboard');
          }
        }
      ]
    );
  };

  const mapSurveyAnswers = () => {
    const mappedAnswers = {};
    SURVEY_QUESTIONS.forEach(question => {
      let answer;
      if (question.type === 'multi-select') {
        answer = answers[question.id] || [];
      } else {
        answer = answers[question.id];
      }
      mappedAnswers[question.id] = answer;
    });
    return mappedAnswers;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Get the API base URL from config
      const { API_BASE_URL } = require('../config/api');
      
      // Get the auth token from the auth context
      const token = auth || user?.token;
      
      if (!token) {
        console.error('No authentication token found, skipping survey submission');
        // Mark as skipped and go to dashboard
        await AsyncStorage.setItem('@eco_lens_survey_skipped', 'true');
        navigation.navigate('Dashboard');
        return;
      }
      
      console.log('Submitting survey with token:', token.substring(0, 20) + '...');
      
      const response = await fetch(`${API_BASE_URL}/survey/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productInterests: mapSurveyAnswers()[1] || [],
          shoppingFrequency: mapSurveyAnswers()[2] || 'Occasionally',
          shoppingPurpose: mapSurveyAnswers()[3] || 'Personal use',
          priceRange: mapSurveyAnswers()[4] || 'Mid-range',
          wantsDeals: mapSurveyAnswers()[5] || 'Yes',
          preferredDevices: mapSurveyAnswers()[6] || ['Mobile'],
          suggestionType: mapSurveyAnswers()[7] || 'Both',
          ecoFriendlyPreference: mapSurveyAnswers()[8] || 'Yes',
          interestedInNewProducts: mapSurveyAnswers()[9] || 'Yes',
          dashboardCategories: mapSurveyAnswers()[10] || ['Electronics', 'Fashion']
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit survey');
      }

      const result = await response.json();
      console.log('Survey submitted successfully:', result);

      // Mark survey as completed in local storage
      await AsyncStorage.setItem('@eco_lens_survey_completed', 'true');
      
      // Navigate to personalized dashboard
      navigation.navigate('Dashboard');
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      
      // Show user-friendly error with options
      Alert.alert(
        'Submission Error',
        'Failed to submit your preferences. You can try again or skip the survey for now.',
        [
          {
            text: 'Skip Survey',
            style: 'destructive',
            onPress: () => {
              // Mark as skipped and go to dashboard
              AsyncStorage.setItem('@eco_lens_survey_skipped', 'true');
              navigation.navigate('Dashboard');
            }
          },
          {
            text: 'Try Again',
            onPress: () => {
              // Retry submission
              handleSubmit();
            }
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderQuestion = () => {
    const question = SURVEY_QUESTIONS[currentQuestion];
    const answer = answers[question.id];

    return (
      <Animated.View style={[styles.questionContainer, { opacity: fadeAnim }]}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>
            Question {currentQuestion + 1} of {SURVEY_QUESTIONS.length}
          </Text>
          <Text style={styles.questionText}>{question.question}</Text>
          {question.maxSelections && (
            <Text style={styles.selectionHint}>
              Select up to {question.maxSelections} options
            </Text>
          )}
        </View>

        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {question.options.map((option, index) => {
            const isSelected = question.type === 'multi-select' 
              ? (answer || []).includes(option)
              : answer === option;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  isSelected && styles.optionButtonSelected
                ]}
                onPress={() => handleAnswerSelect(question.id, option)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.optionIndicator,
                    isSelected && styles.optionIndicatorSelected
                  ]}>
                    {isSelected && (
                      <Text style={styles.optionCheckmark}>✓</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected
                  ]}>
                    {option}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderProgressBar = () => {
    const progress = (currentQuestion + 1) / SURVEY_QUESTIONS.length;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {Math.round(progress * 100)}% Complete
        </Text>
      </View>
    );
  };

  const renderButtons = () => {
    const question = SURVEY_QUESTIONS[currentQuestion];
    const answer = answers[question.id];
    const hasAnswer = answer && (Array.isArray(answer) ? answer.length > 0 : true);

    return (
      <View style={styles.buttonContainer}>
        {currentQuestion > 0 && (
          <TouchableOpacity
            style={[styles.button, styles.previousButton]}
            onPress={handlePrevious}
          >
            <Text style={styles.previousButtonText}>Previous</Text>
          </TouchableOpacity>
        )}

        <View style={styles.rightButtons}>
          {SURVEY_CONFIG.allowSkip && (
            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.nextButton,
              !hasAnswer && question.required && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!hasAnswer && question.required}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.nextButtonText}>
                {currentQuestion === SURVEY_QUESTIONS.length - 1 ? 'Complete' : 'Next'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Personalize Your Experience</Text>
          <TouchableOpacity
            style={styles.skipEntireButton}
            onPress={handleSkipSurvey}
          >
            <Text style={styles.skipEntireButtonText}>Skip Survey</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          Help us recommend products you'll love by answering a few quick questions
        </Text>
      </View>

      {renderProgressBar()}
      {renderQuestion()}
      {renderButtons()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  skipEntireButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  skipEntireButtonText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E9ECEF',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionNumber: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    lineHeight: 28,
    marginBottom: 8,
  },
  selectionHint: {
    fontSize: 14,
    color: '#6C757D',
    fontStyle: 'italic',
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F8FF',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  optionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DEE2E6',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIndicatorSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  optionCheckmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  optionText: {
    fontSize: 16,
    color: '#212529',
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  previousButton: {
    backgroundColor: '#6C757D',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#DEE2E6',
  },
  nextButton: {
    backgroundColor: theme.colors.primary,
  },
  nextButtonDisabled: {
    backgroundColor: '#DEE2E6',
  },
  previousButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButtonText: {
    color: '#6C757D',
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingSurvey;
