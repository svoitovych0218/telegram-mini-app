import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { GamesList } from './Pages/GamesList';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Bet } from './Pages/Bet';
import { Header } from './Components/Header';
// import logo from './logo.svg';

export interface ITelegramContext {
  webApp?: WebApp;
  user?: WebAppUser;
}

export const TelegramContext = createContext<ITelegramContext>({});

export const TelegramProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    const app = (window as any).Telegram?.WebApp;
    if (app) {
      app.ready();
      setWebApp(app);
    }
  }, []);

  const value = useMemo(() => {
    return webApp
      ? {
        webApp,
        unsafeData: webApp.initDataUnsafe,
        user: webApp.initDataUnsafe.user,
      }
      : {};
  }, [webApp]);
  return (
    <TelegramContext.Provider value={value}>
      {/* Make sure to include script tag with "beforeInteractive" strategy to pre-load web-app script */}
      {children}
    </TelegramContext.Provider>
  );
};

export const useTelegram = () => useContext(TelegramContext);


function App() {
  const { user, webApp } = useTelegram();
  useEffect(() => {
    webApp?.MainButton.show();
  }, [webApp?.MainButton])
  return (
    <div>
      {/* {user ? (
        <div style={{backgroundColor:'white'}}>
          <h1>Welcome {user?.username}</h1>
          <GamesList/>
          User data:
          <pre>{JSON.stringify(user, null, 2)}</pre>
          Eniter Web App data:
          <pre>{JSON.stringify(webApp, null, 2)}</pre>
        </div>
      ) : (
        <div>Make sure web app is opened from telegram client</div>
      )} */}
      {user ? (
        <>
          <Header />
          <Routes>
            <Route index element={<GamesList />} />
            <Route path={'bet'} element={<Bet />} />
          </Routes>
        </>) : (<div>Make sure web app is opened from telegram client</div>)}

    </div>
  );
}

const WithTelegramProvider = () => {
  return (
    <TelegramProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </TelegramProvider>
  );
};

export default WithTelegramProvider;
