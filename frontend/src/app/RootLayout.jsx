import React, { useEffect } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import GlobalLoader from '../components/ui/Loaders/GlobalLoader';
const RootLayout = () => {
  const navigation = useNavigation();
  return (
    <>
      <GlobalLoader navigationState={navigation.state} />
      <Outlet />
    </>
  );
};
export default RootLayout;
