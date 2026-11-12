export type GeoReading =
  | { status: "pending" }
  | { status: "shared"; lat: number; lng: number; accuracyM: number }
  | { status: "refused" } // the person said no
  | { status: "unavailable" }; // no HTTPS, no signal, timeout, or no geolocation support

// navigator.geolocation uses callbacks. Wrapping it in a Promise lets callers use await.
// It always resolves, never rejects: a missing location is a normal outcome, not an error.
export function readLocation(): Promise<GeoReading> {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ status: "unavailable" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        status: "shared",
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: Math.round(position.coords.accuracy),
      }),
      (error) => resolve({ status: error.code === error.PERMISSION_DENIED ? "refused" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  });
}
