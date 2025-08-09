import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import FooterSection from './FooterSection';
import AllInOneChat from '../widget/allinonechat';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <FooterSection />
      <AllInOneChat />
    </div>
  );
};

export default Layout;
