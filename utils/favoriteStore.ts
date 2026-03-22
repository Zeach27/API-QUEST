import { Destination } from "@/constants/destinations";

type Listener = (favorites: Destination[]) => void;

let _favorites: Destination[] = [];
const listeners = new Set<Listener>();

export const getFavorites = () => _favorites;

export const isFavorite = (id: string) => _favorites.some((fav) => fav.id === id);

export const toggleFavorite = (destination: Destination) => {
  const index = _favorites.findIndex((fav) => fav.id === destination.id);
  if (index >= 0) {
    _favorites.splice(index, 1);
  } else {
    _favorites.push(destination);
  }
  const result = [..._favorites];
  listeners.forEach((listener) => listener(result));
  return result;
};

export const subscribeFavorites = (listener: Listener) => {
  listeners.add(listener);
  listener(getFavorites());
  return () => {
    listeners.delete(listener);
  };
};
