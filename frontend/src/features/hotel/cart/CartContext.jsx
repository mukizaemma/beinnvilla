/**
 * CART CONTEXT
 * ─────────────────────────────────────────────────────────────
 * Site-wide "stay cart" — lets a guest add rooms from any page
 * (Home, Rooms list, a room detail page) before ever picking dates.
 * Dates/guests are deliberately deferred until the booking flow
 * (see BookingPage / Step1Stay) rather than asked here, matching the
 * "Dates — add on confirm booking page" pattern this is modeled on.
 *
 * Persisted to sessionStorage so a refresh or an accidental back
 * navigation doesn't wipe out someone's in-progress selection — but a
 * closed tab does, which is the right lifetime for a cart nobody has
 * committed to yet.
 * ─────────────────────────────────────────────────────────────
 */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const STORAGE_KEY = 'gv-stay-cart';

const initialState = {
  rooms: [], // [{ roomId, name, pricePerNight, adults, children }]
  experiences: [], // [{ experienceId, name, price }] — flat price, not per-night
};

function loadInitialState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.rooms)) return initialState;
    return {
      rooms: parsed.rooms,
      experiences: Array.isArray(parsed.experiences) ? parsed.experiences : [],
    };
  } catch {
    // Corrupt/unavailable storage shouldn't crash the site — just
    // start with an empty cart.
    return initialState;
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ROOM': {
      const { room } = action;
      // Don't add the same room twice — bump isn't supported here since
      // "Rooms" count is set per-room, not per-line-quantity.
      if (state.rooms.some((r) => r.roomId === room.id)) return state;
      return {
        ...state,
        rooms: [
          ...state.rooms,
          {
            roomId: room.id,
            name: room.name,
            pricePerNight: room.pricePerNight,
            adults: 6,
            children: 0,
            priceWithBreakfast: room.priceWithBreakfast,
            monthlyRate: room.monthlyRate,
          },
        ],
      };
    }
    case 'REMOVE_ROOM':
      return { ...state, rooms: state.rooms.filter((r) => r.roomId !== action.roomId) };
    case 'SET_ROOM_GUESTS':
      return {
        ...state,
        rooms: state.rooms.map((r) =>
          r.roomId === action.roomId
            ? { ...r, adults: action.adults, children: action.children }
            : r,
        ),
      };
    case 'ADD_EXPERIENCE': {
      const { experience } = action;
      if (state.experiences.some((e) => e.experienceId === experience.id)) return state;
      return {
        ...state,
        experiences: [
          ...state.experiences,
          { experienceId: experience.id, name: experience.name, price: experience.price },
        ],
      };
    }
    case 'REMOVE_EXPERIENCE':
      return {
        ...state,
        experiences: state.experiences.filter((e) => e.experienceId !== action.experienceId),
      };
    case 'CLEAR_ALL':
      return initialState;
    default:
      return state;
  }
}

const CartStateContext = createContext(null);
const CartActionsContext = createContext(null);

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full/unavailable (private browsing, etc.) — cart still
      // works for the session, it just won't survive a refresh.
    }
  }, [state]);

  const actions = useMemo(
    () => ({
      addRoom: (room) => dispatch({ type: 'ADD_ROOM', room }),
      removeRoom: (roomId) => dispatch({ type: 'REMOVE_ROOM', roomId }),
      setRoomGuests: (roomId, adults, children) =>
        dispatch({ type: 'SET_ROOM_GUESTS', roomId, adults, children }),
      addExperience: (experience) => dispatch({ type: 'ADD_EXPERIENCE', experience }),
      removeExperience: (experienceId) => dispatch({ type: 'REMOVE_EXPERIENCE', experienceId }),
      clearAll: () => dispatch({ type: 'CLEAR_ALL' }),
    }),
    [],
  );

  return (
    <CartStateContext.Provider value={state}>
      <CartActionsContext.Provider value={actions}>{children}</CartActionsContext.Provider>
    </CartStateContext.Provider>
  );
}

/** Read-only cart state: { rooms, experiences }, plus derived counts/total. */
export function useCart() {
  const state = useContext(CartStateContext);
  if (!state) throw new Error('useCart must be used within a CartProvider');

  const roomCount = state.rooms.length;
  const experienceCount = state.experiences.length;
  // Rooms are per-night (dates aren't known yet at the cart level — see
  // pricing.js for the date-aware version used once Step 1 sets them);
  // experiences are a flat one-time price either way.
  const grandTotal =
    state.rooms.reduce((sum, r) => sum + r.pricePerNight, 0) +
    state.experiences.reduce((sum, e) => sum + e.price, 0);
  const isInCart = (roomId) => state.rooms.some((r) => r.roomId === roomId);
  const isExperienceInCart = (experienceId) =>
    state.experiences.some((e) => e.experienceId === experienceId);

  return { ...state, roomCount, experienceCount, grandTotal, isInCart, isExperienceInCart };
}

/** Cart mutations, split from useCart so components that only dispatch
 *  (e.g. a "Book Now" button) don't re-render on every cart change. */
export function useCartActions() {
  const actions = useContext(CartActionsContext);
  if (!actions) throw new Error('useCartActions must be used within a CartProvider');
  return actions;
}