import React from 'react';
import { StatusBar } from 'expo-status-bar';
import CustomerDashboard from './src/screens/customer/CustomerDashboard';

export default function App() {
  return (
    <>
      <CustomerDashboard />
      <StatusBar style="auto" />
    </>
  );
}
