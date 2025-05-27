import React from 'react';
import ReactDOM from 'react-dom/client';
import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import App from './App.jsx';
import './index.css';

import store from './redux/store.js'; // Your Redux store
import ShopContextProvider from './context/ShopContext.jsx'; // Your custom context

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
