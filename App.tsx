import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {initializeNotifications} from './src/services/notificationService';

function App(): React.JSX.Element {
  useEffect(() => {
    // Initialize push notifications
    initializeNotifications();
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366f1" />
      <AppNavigator />
    </>
  );
}

export default App;
