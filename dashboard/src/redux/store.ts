import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './reducers/counter.reducer';
import devicesReducer from './reducers/devices.reducer';

const store = configureStore({
    reducer: {
        counter: counterReducer,
        devices: devicesReducer,
    },
});

export default store;

// // Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
