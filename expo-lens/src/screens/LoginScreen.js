import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AuthService from '../api/authService';
import SurveyService from '../api/surveyService';
import { useAuth } from '../hooks/useAuthLogin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { API_BASE_URL } from '../config/api';
import Constants from 'expo-constants';
import debugOAuthConfig from '../utils/oauthDebug';

WebBrowser.maybeCompleteAuthSession();