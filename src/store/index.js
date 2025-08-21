import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import postsReducer from './postsSlice';

const persistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['posts'], // Only persist posts
};

const persistedReducer = persistReducer(persistConfig, postsReducer);

export const store = configureStore({
  reducer: {
    posts: persistedReducer,
    // other reducers...
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
