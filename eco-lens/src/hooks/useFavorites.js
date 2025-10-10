import React, { createContext, useContext, useReducer, useEffect } from 'react';
import FavoritesService from '../api/favoritesService';
import { useAuth } from './useAuthLogin';

// Action types
const FAVORITES_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_FAVORITES: 'SET_FAVORITES',
  ADD_FAVORITE: 'ADD_FAVORITE',
  REMOVE_FAVORITE: 'REMOVE_FAVORITE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_FAVORITE_STATUS: 'SET_FAVORITE_STATUS',
};

// Initial state
const initialState = {
  favorites: [],
  favoriteIds: new Set(),
  loading: false,
  error: null,
  favoritesCount: 0,
};

// Reducer
const favoritesReducer = (state, action) => {
  switch (action.type) {
    case FAVORITES_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error, // Clear error when loading starts
      };

    case FAVORITES_ACTIONS.SET_FAVORITES:
      const favoriteIds = new Set(action.payload.map(product => product.id || product._id));
      return {
        ...state,
        favorites: action.payload,
        favoriteIds,
        favoritesCount: action.payload.length,
        loading: false,
        error: null,
      };

    case FAVORITES_ACTIONS.ADD_FAVORITE:
      const newFavorite = action.payload;
      const updatedFavorites = [...state.favorites];
      
      // Check if not already in favorites
      if (!state.favoriteIds.has(newFavorite.id)) {
        updatedFavorites.push(newFavorite);
      }
      
      const updatedIds = new Set(state.favoriteIds);
      updatedIds.add(newFavorite.id);
      
      return {
        ...state,
        favorites: updatedFavorites,
        favoriteIds: updatedIds,
        favoritesCount: updatedFavorites.length,
        error: null,
      };

    case FAVORITES_ACTIONS.REMOVE_FAVORITE:
      const productIdToRemove = action.payload;
      const filteredFavorites = state.favorites.filter(
        product => (product.id || product._id) !== productIdToRemove
      );
      
      const filteredIds = new Set(state.favoriteIds);
      filteredIds.delete(productIdToRemove);
      
      return {
        ...state,
        favorites: filteredFavorites,
        favoriteIds: filteredIds,
        favoritesCount: filteredFavorites.length,
        error: null,
      };

    case FAVORITES_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case FAVORITES_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case FAVORITES_ACTIONS.SET_FAVORITE_STATUS:
      const { productId, isFavorite } = action.payload;
      const statusIds = new Set(state.favoriteIds);
      
      if (isFavorite) {
        statusIds.add(productId);
      } else {
        statusIds.delete(productId);
      }
      
      return {
        ...state,
        favoriteIds: statusIds,
      };

    default:
      return state;
  }
};

// Context
const FavoritesContext = createContext();

// Provider component
export const FavoritesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { auth, user } = useAuth();

  // Load favorites when user is authenticated
  useEffect(() => {
    if (auth && user) {
      loadFavorites();
    } else {
      // Clear favorites when user logs out
      dispatch({ type: FAVORITES_ACTIONS.SET_FAVORITES, payload: [] });
    }
  }, [auth, user]);

  // Load user's favorites from API
  const loadFavorites = async () => {
    try {
      dispatch({ type: FAVORITES_ACTIONS.SET_LOADING, payload: true });
      const response = await FavoritesService.getFavorites();
      dispatch({ 
        type: FAVORITES_ACTIONS.SET_FAVORITES, 
        payload: response.favorites || [] 
      });
    } catch (error) {
      console.error('Failed to load favorites:', error);
      dispatch({ 
        type: FAVORITES_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to load favorites' 
      });
    } finally {
      dispatch({ type: FAVORITES_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Add product to favorites
  const addToFavorites = async (product) => {
    if (!auth) {
      dispatch({ 
        type: FAVORITES_ACTIONS.SET_ERROR, 
        payload: 'Please login to add favorites' 
      });
      return false;
    }

    try {
      // Optimistic update
      dispatch({ type: FAVORITES_ACTIONS.ADD_FAVORITE, payload: product });
      
      // API call
      await FavoritesService.addToFavorites(product.id || product._id);
      
      console.log(`✅ Added ${product.name} to favorites`);
      return true;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      
      // Revert optimistic update
      dispatch({ 
        type: FAVORITES_ACTIONS.REMOVE_FAVORITE, 
        payload: product.id || product._id 
      });
      
      dispatch({ 
        type: FAVORITES_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to add to favorites' 
      });
      return false;
    }
  };

  // Remove product from favorites
  const removeFromFavorites = async (productId) => {
    if (!auth) {
      return false;
    }

    try {
      // Find the product before removing (for potential revert)
      const productToRemove = state.favorites.find(
        product => (product.id || product._id) === productId
      );
      
      // Optimistic update
      dispatch({ type: FAVORITES_ACTIONS.REMOVE_FAVORITE, payload: productId });
      
      // API call
      await FavoritesService.removeFromFavorites(productId);
      
      console.log(`✅ Removed product from favorites`);
      return true;
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      
      // Revert optimistic update if we have the product data
      if (productToRemove) {
        dispatch({ type: FAVORITES_ACTIONS.ADD_FAVORITE, payload: productToRemove });
      }
      
      dispatch({ 
        type: FAVORITES_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to remove from favorites' 
      });
      return false;
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (product) => {
    const productId = product.id || product._id;
    const isFavorited = state.favoriteIds.has(productId);
    
    if (isFavorited) {
      return await removeFromFavorites(productId);
    } else {
      return await addToFavorites(product);
    }
  };

  // Check if product is favorited
  const isFavorited = (productId) => {
    return state.favoriteIds.has(productId);
  };

  // Check favorite status from API (for real-time sync)
  const checkFavoriteStatus = async (productId) => {
    if (!auth) return false;
    
    try {
      const response = await FavoritesService.checkFavoriteStatus(productId);
      dispatch({
        type: FAVORITES_ACTIONS.SET_FAVORITE_STATUS,
        payload: { productId, isFavorite: response.isFavorite }
      });
      return response.isFavorite;
    } catch (error) {
      console.error('Failed to check favorite status:', error);
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: FAVORITES_ACTIONS.CLEAR_ERROR });
  };

  // Refresh favorites
  const refreshFavorites = () => {
    if (auth && user) {
      loadFavorites();
    }
  };

  const value = {
    // State
    favorites: state.favorites,
    favoriteIds: state.favoriteIds,
    loading: state.loading,
    error: state.error,
    favoritesCount: state.favoritesCount,
    
    // Actions
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    isFavorited,
    checkFavoriteStatus,
    clearError,
    refreshFavorites,
    loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Hook to use favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  
  return context;
};

export default useFavorites;
