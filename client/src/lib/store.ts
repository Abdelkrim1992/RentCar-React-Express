import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define types for our state
interface BookingState {
  bookings: any[] | null;
  cars: any[] | null;
  customers: any[] | null;
  lastFetched: {
    bookings: number | null;
    cars: number | null;
    customers: number | null;
  }
}

// Data slice state type
interface DataState {
  [key: string]: {
    data: any[];
    timestamp: number;
  }
}

// Initial state for booking slice
const initialBookingState: BookingState = {
  bookings: null,
  cars: null,
  customers: null,
  lastFetched: {
    bookings: null,
    cars: null,
    customers: null
  }
};

// Initial state for data slice
const initialDataState: DataState = {};

// Create a slice for our booking data
const bookingSlice = createSlice({
  name: 'booking',
  initialState: initialBookingState,
  reducers: {
    setBookings: (state, action: PayloadAction<any[]>) => {
      state.bookings = action.payload;
      state.lastFetched.bookings = Date.now();
    },
    setCars: (state, action: PayloadAction<any[]>) => {
      state.cars = action.payload;
      state.lastFetched.cars = Date.now();
    },
    setCustomers: (state, action: PayloadAction<any[]>) => {
      state.customers = action.payload;
      state.lastFetched.customers = Date.now();
    },
    clearData: (state) => {
      state.bookings = null;
      state.cars = null;
      state.customers = null;
      state.lastFetched = {
        bookings: null,
        cars: null,
        customers: null
      };
    }
  }
});

// Create a generic data slice for key-value storage
const dataSlice = createSlice({
  name: 'data',
  initialState: initialDataState,
  reducers: {
    setData: (state, action: PayloadAction<{key: string; data: any[]; timestamp: number}>) => {
      const { key, data, timestamp } = action.payload;
      state[key] = {
        data,
        timestamp
      };
    },
    removeData: (state, action: PayloadAction<string>) => {
      const key = action.payload;
      delete state[key];
    },
    clearAllData: () => initialDataState
  }
});

// Export actions
export const { setBookings, setCars, setCustomers, clearData } = bookingSlice.actions;
export const { setData, removeData, clearAllData } = dataSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer,
    data: dataSlice.reducer
  }
});

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for using Redux dispatch and selector
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;