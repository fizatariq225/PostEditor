// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client"; // Correct import for React 18+
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { EditorProvider } from "./context/EditorContext.jsx";
import App from "./App.jsx";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <EditorProvider>
      <App />
    </EditorProvider>
  </Provider>
);