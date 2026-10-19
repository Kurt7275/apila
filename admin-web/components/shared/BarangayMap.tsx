"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  Home,
  Moon,
  Sun,
  Globe,
  Search,
  ExternalLink,
  Locate,
  Loader2,
  X,
} from "lucide-react";

// Fix default marker icons
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [20, 33],
  iconAnchor: [10, 33],
  popupAnchor: [1, -28],
  shadowSize: [33, 33],
  className: "hue-rotate-[200deg]", // tint blue for user marker
});

// Barangay Lapasan Hall, CM Recto Avenue, Cagayan de Oro City
const LAPASAN_COORDS: [number, number] = [8.48332, 124.66475];

const TILE_LAYERS = {
  light: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  dark: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> World Imagery',
  },
};

// Internal controller to imperatively control the map
function MapController({
  command,
}: {
  command: { type: string; coords?: [number, number]; zoom?: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!command) return;
    if (command.coords) {
      map.flyTo(command.coords, command.zoom ?? 16, { duration: 1.2 });
    }
  }, [command, map]);
  return null;
}

export default function BarangayMap() {
  const [tileMode, setTileMode] = useState<"light" | "dark" | "satellite">("light");
  const [search, setSearch] = useState("");
  const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);
  const [searchLabel, setSearchLabel] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [userCoords, setUserCoords] = useState<[number, number] | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [navLoading, setNavLoading] = useState(false);
  const [navError, setNavError] = useState("");
  const [navActive, setNavActive] = useState(false);

  const [mapCommand, setMapCommand] = useState<{
    type: string;
    coords?: [number, number];
    zoom?: number;
  } | null>(null);

  const tile = TILE_LAYERS[tileMode];

  // --- Search via Nominatim ---
  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setSearchLoading(true);
    setSearchError("");
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (!data.length) {
        setSearchError("Location not found. Try a different search.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const coords: [number, number] = [parseFloat(lat), parseFloat(lon)];
      setSearchMarker(coords);
      setSearchLabel(display_name);
      setMapCommand({ type: "fly", coords, zoom: 15 });
    } catch {
      setSearchError("Search failed. Check your connection.");
    } finally {
      setSearchLoading(false);
    }
  }

  function clearSearch() {
    setSearch("");
    setSearchMarker(null);
    setSearchLabel("");
    setSearchError("");
  }

  // --- Start Navigation via OSRM ---
  async function handleNavigation() {
    setNavError("");
    setNavLoading(true);
    setNavActive(false);
    setRouteCoords([]);

    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        const origin: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserCoords(origin);
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${LAPASAN_COORDS[1]},${LAPASAN_COORDS[0]}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.code !== "Ok") throw new Error("No route found.");
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRouteCoords(coords);
          setNavActive(true);
          // Fit map to show full route
          setMapCommand({ type: "fit" });
        } catch {
          setNavError("Could not fetch route. Try again.");
        } finally {
          setNavLoading(false);
        }
      },
      () => {
        setNavError("Location access denied. Enable GPS and try again.");
        setNavLoading(false);
      }
    );
  }

  function clearNav() {
    setNavActive(false);
    setRouteCoords([]);
    setUserCoords(null);
    setNavError("");
    setMapCommand({ type: "fly", coords: LAPASAN_COORDS, zoom: 16 });
  }

  return (
    <div className="flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Map area */}
      <div className="relative" style={{ height: "420px" }}>
        <MapContainer
          center={LAPASAN_COORDS}
          zoom={16}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer url={tile.url} attribution={tile.attribution} />
          <MapController command={mapCommand} />

          {/* Barangay Hall Marker */}
          <Marker position={LAPASAN_COORDS} icon={markerIcon}>
            <Popup>
              <div className="text-sm font-semibold text-slate-900">🏛️ Barangay Hall Lapasan</div>
              <div className="text-xs text-slate-600 mt-1">
                CM Recto Avenue, Lapasan<br />Cagayan de Oro City 9000
              </div>
            </Popup>
          </Marker>

          {/* Search result marker */}
          {searchMarker && (
            <Marker position={searchMarker} icon={markerIcon}>
              <Popup>
                <div className="text-xs text-slate-700 max-w-[200px]">{searchLabel}</div>
              </Popup>
            </Marker>
          )}

          {/* User location marker */}
          {userCoords && (
            <>
              <Circle
                center={userCoords}
                radius={30}
                pathOptions={{ color: "#EA580C", fillColor: "#EA580C", fillOpacity: 0.25 }}
              />
              <Marker position={userCoords} icon={userIcon}>
                <Popup>
                  <div className="text-xs font-semibold text-slate-700">📍 Your Location</div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Route polyline */}
          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "#EA580C", weight: 5, opacity: 0.85, dashArray: undefined }}
            />
          )}
        </MapContainer>

        {/* Search bar overlay */}
        <form
          onSubmit={handleSearch}
          className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] w-72 sm:w-96"
        >
          <div className="flex items-center bg-white rounded-xl shadow-lg border border-slate-200 px-3 py-2 gap-2">
            {searchLoading ? (
              <Loader2 className="w-4 h-4 text-orange-500 shrink-0 animate-spin" />
            ) : (
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
            )}
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchError(""); }}
              placeholder="Search location..."
              className="flex-1 text-sm text-slate-700 bg-transparent outline-none placeholder:text-slate-400"
            />
            {search && (
              <button type="button" onClick={clearSearch}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>
          {searchError && (
            <p className="mt-1 text-xs text-red-500 bg-white rounded-lg px-3 py-1 shadow">{searchError}</p>
          )}
        </form>

        {/* Bottom-left icon buttons */}
        <div className="absolute bottom-8 left-3 z-[1000] flex items-center gap-2">
          <button
            onClick={() => setMapCommand({ type: "fly", coords: LAPASAN_COORDS, zoom: 16 })}
            title="Reset to Barangay Hall"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
          >
            <Home className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (userCoords) setMapCommand({ type: "fly", coords: userCoords, zoom: 16 });
              else handleNavigation();
            }}
            title="Locate me"
            className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-slate-600 hover:text-orange-600 hover:border-orange-300 transition-colors"
          >
            <Locate className="w-4 h-4" />
          </button>
          {/* Globe — satellite/realistic toggle */}
          <button
            onClick={() => setTileMode((m) => m === "satellite" ? "light" : "satellite")}
            title={tileMode === "satellite" ? "Switch to standard map" : "Switch to satellite view"}
            className={`w-10 h-10 rounded-xl border shadow-md flex items-center justify-center transition-colors ${
              tileMode === "satellite"
                ? "bg-orange-600 border-orange-600 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300"
            }`}
          >
            <Globe className="w-4 h-4" />
          </button>
          {/* Moon/Sun — dark mode toggle (disabled in satellite mode) */}
          <button
            onClick={() => setTileMode((m) => m === "dark" ? "light" : "dark")}
            title={tileMode === "dark" ? "Light map" : "Dark map"}
            disabled={tileMode === "satellite"}
            className={`w-10 h-10 rounded-xl border shadow-md flex items-center justify-center transition-colors ${
              tileMode === "dark"
                ? "bg-slate-800 border-slate-800 text-white"
                : "bg-white border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {tileMode === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          {navActive && (
            <button
              onClick={clearNav}
              title="Clear route"
              className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 shadow-md flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Start Navigation button */}
        <button
          onClick={navActive ? clearNav : handleNavigation}
          disabled={navLoading}
          className="absolute bottom-8 right-3 z-[1000] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-70 text-white text-sm font-bold shadow-lg transition-colors"
        >
          {navLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          {navLoading ? "Getting route…" : navActive ? "Clear Route" : "Start Navigation"}
        </button>

        {/* Nav error */}
        {navError && (
          <div className="absolute bottom-20 right-3 z-[1000] bg-white border border-red-200 rounded-lg px-3 py-2 shadow text-xs text-red-500 max-w-[220px]">
            {navError}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-slate-100 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-slate-500">
          Powered by OSM, Leaflet &amp; OSRM
        </p>
        <a
          href="https://www.google.com/maps/search/?api=1&query=Barangay+Hall+Lapasan+Cagayan+de+Oro"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 border border-orange-300 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Bigger Map on Google
        </a>
      </div>
    </div>
  );
}
