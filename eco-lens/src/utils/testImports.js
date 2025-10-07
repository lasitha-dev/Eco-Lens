/**
 * Test file to verify imports are working correctly
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

console.log('=== Import Test ===');
console.log('Constants available:', !!Constants);
console.log('Platform available:', !!Platform);
console.log('Platform.OS:', Platform.OS || 'Not available');

if (Constants) {
  try {
    console.log('Constants.appOwnership:', Constants.appOwnership || 'Not available');
    console.log('Constants.platform:', Constants.platform || 'Not available');
  } catch (error) {
    console.log('Error accessing Constants properties:', error.message);
  }
}

export default {
  constantsAvailable: !!Constants,
  platformAvailable: !!Platform,
};