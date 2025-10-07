/**
 * Test file for oauthDebug utility
 */

import oauthDebug from './oauthDebug';

console.log('Testing oauthDebug import...');

// Test the functions
try {
  const { debugOAuthConfig, extractTokensFromUrl } = oauthDebug;
  
  console.log('debugOAuthConfig function:', typeof debugOAuthConfig);
  console.log('extractTokensFromUrl function:', typeof extractTokensFromUrl);
  
  if (typeof debugOAuthConfig === 'function') {
    console.log('debugOAuthConfig is a function - OK');
  } else {
    console.error('debugOAuthConfig is not a function:', typeof debugOAuthConfig);
  }
  
  if (typeof extractTokensFromUrl === 'function') {
    console.log('extractTokensFromUrl is a function - OK');
  } else {
    console.error('extractTokensFromUrl is not a function:', typeof extractTokensFromUrl);
  }
} catch (error) {
  console.error('Error testing oauthDebug:', error);
}

export default oauthDebug;