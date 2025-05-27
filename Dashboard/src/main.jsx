
import App from './App.jsx'
import './index.css'
import { Provider } from "react-redux";
import store from "./redux/store.js"; // Import your Redux store


import React from "react";
import ReactDOM from "react-dom/client";




ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);