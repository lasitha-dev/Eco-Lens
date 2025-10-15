import React, { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import PostPurchaseRatingModal from './PostPurchaseRatingModal';
import RatingService from '../api/ratingService';

const PostPurchaseRatingManager = ({ 
  visible, 
  onComplete, 
  orderId, 
  orderItems, 
  authToken 
}) => {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);

  useEffect(() => {
    if (visible && orderItems && orderItems.length > 0) {
      // Filter out products that need rating
      setPendingProducts(orderItems);
      setCurrentProductIndex(0);
      setShowRatingModal(true);
    }
  }, [visible, orderItems]);

  const handleRatingSubmitted = () => {
    // Move to next product
    const nextIndex = currentProductIndex + 1;
    
    if (nextIndex < pendingProducts.length) {
      setCurrentProductIndex(nextIndex);
    } else {
      // All products rated, close the flow
      setShowRatingModal(false);
      onComplete && onComplete();
    }
  };

  const handleSkipRating = () => {
    // Move to next product or close if last
    const nextIndex = currentProductIndex + 1;
    
    if (nextIndex < pendingProducts.length) {
      setCurrentProductIndex(nextIndex);
    } else {
      setShowRatingModal(false);
      onComplete && onComplete();
    }
  };

  const handleCloseAll = () => {
    Alert.alert(
      'Skip All Ratings',
      'Are you sure you want to skip rating all products? You can rate them later from your order history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip All', 
          style: 'destructive',
          onPress: () => {
            setShowRatingModal(false);
            onComplete && onComplete();
          }
        }
      ]
    );
  };

  if (!showRatingModal || !pendingProducts[currentProductIndex]) {
    return null;
  }

  const currentProduct = pendingProducts[currentProductIndex];
  const progress = `${currentProductIndex + 1} of ${pendingProducts.length}`;

  return (
    <View style={{ flex: 1 }}>
      <PostPurchaseRatingModal
        visible={showRatingModal}
        onClose={handleCloseAll}
        product={currentProduct}
        orderId={orderId}
        authToken={authToken}
        onRatingSubmitted={handleRatingSubmitted}
        progress={progress}
        totalProducts={pendingProducts.length}
      />
    </View>
  );
};

export default PostPurchaseRatingManager;
