import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux';
import store from './redux/store.js';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <BrowserRouter>
      <GoogleOAuthProvider clientId="1063472421493-dsbk7mc5tiuml1btm6hqbi8l4e8kps4g.apps.googleusercontent.com">
        <App />
        <ToastContainer position="top-right" autoClose={3000} />
      </GoogleOAuthProvider>
    </BrowserRouter>
  </Provider>
);