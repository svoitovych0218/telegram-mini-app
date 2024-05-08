import React from 'react';
import ReactDOM from 'react-dom/client';

import { Root } from '~/components/Root';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
