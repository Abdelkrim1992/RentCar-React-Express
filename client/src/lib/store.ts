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

// Initial state
const initialState: BookingState = {
  bookings: null,
  cars: null,
  customers: null,
  lastFetched: {
    bookings: null,
    cars: null,
    customers: null
  }
};

// Create a slice for our data
const bookingSlice = createSlice({
  name: 'booking',
  initialState,
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

// Export actions
export const { setBookings, setCars, setCustomers, clearData } = bookingSlice.actions;

// Configure the Redux store
export const store = configureStore({
  reducer: {
    booking: bookingSlice.reducer
  }
});

// Define RootState type
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for using Redux dispatch and selector
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;