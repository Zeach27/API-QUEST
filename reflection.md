# APK is in Release

# API-QUEST Project Reflection

APIs Used

The application leverages OpenStreetMap for location search and points-of-interest discovery, and OpenWeather API for real-time weather information.

Problem Solved

Often, people hear about exciting destinations but don’t know exactly where they are or how to reach them. This app addresses that by providing a map-based discovery tool that allows users to search and locate unfamiliar places quickly using OpenStreetMap data. Users can also check the current weather at the destination through OpenWeather, helping them decide if it’s a good time to visit. By combining location and environmental information in one interface, the app serves as a practical travel assistant for both casual explorers and travelers.

Most Difficult Integration

The main challenge was coordinating the interaction between the APIs and the user interface. Both OpenStreetMap and OpenWeather provide asynchronous data, so ensuring that search results, nearby places, and weather information loaded smoothly without blocking the UI required careful state management. Synchronizing these API responses with a dynamic, gesture-driven interface, such as updating the map and bottom sheet in real time, required thoughtful handling of asynchronous calls, debouncing, and UI transitions to maintain a responsive experience.

Future Improvements

Future enhancements could include:

Richer Place Details: Adding reviews, ratings, and images to help users make informed choices.

Advanced Weather Insights: Providing hourly forecasts, alerts, and visual indicators for better planning.

Personalization & Favorites: Using local storage or a backend to save favorites, search history, and user preferences.

Offline Functionality: Supporting offline maps and cached data for areas with limited connectivity.

UI/UX Refinements: Smoother animations, map interactions, and transitions to improve overall user experience.
