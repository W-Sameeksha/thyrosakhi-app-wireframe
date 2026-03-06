import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Navigation, Star, AlertTriangle, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

type Clinic = {
  name: string;
  address: string;
  rating: number | string;
  distance_km?: number;
  phone?: string;
  place_id?: string;
};

const PHCNearby = () => {
  const { t } = useLanguage();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearbyClinics = useCallback(async (lat: number, lng: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/nearby-clinics?lat=${lat}&lng=${lng}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error ?? "Failed to fetch nearby clinics");
      }

      setClinics(data.clinics ?? data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load nearby clinics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get user's current location
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        fetchNearbyClinics(lat, lng);
      },
      (err) => {
        console.error("Location access denied:", err);
        setError("Location access denied. Please enable location services to find nearby clinics.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [fetchNearbyClinics]);

  const openInMaps = (clinic: Clinic) => {
    const query = encodeURIComponent(clinic.name + " " + clinic.address);
    const url = userLocation
      ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${query}`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader titleKey="phcNearby.title" />

      <div className="px-5 pt-4 space-y-4">
        {/* Emergency Alert Banner */}
        <div className="bg-danger/10 border border-danger/30 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-danger flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-danger">{t("phcNearby.alert")}</p>
            <p className="text-sm text-danger/80 mt-1">{t("phcNearby.alertMessage")}</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">{t("phcNearby.loading")}</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 text-center">
            <p className="text-warning font-medium">{error}</p>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => window.location.reload()}
            >
              {t("phcNearby.retry")}
            </Button>
          </div>
        )}

        {/* Clinics List */}
        {!loading && !error && clinics.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>{t("phcNearby.noClinics")}</p>
          </div>
        )}

        {!loading && clinics.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t("phcNearby.found")} {clinics.length} {t("phcNearby.clinicsNear")}
            </p>

            {clinics.map((clinic, index) => (
              <div
                key={index}
                className="bg-card rounded-2xl p-4 shadow-sm border border-border space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground leading-tight">{clinic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{clinic.address}</p>
                  </div>
                  {clinic.rating && clinic.rating !== "N/A" && (
                    <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded-full">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="text-sm font-semibold text-warning">{clinic.rating}</span>
                    </div>
                  )}
                </div>

                {clinic.distance_km && (
                  <p className="text-sm text-primary font-medium">
                    📍 {t("phcNearby.distance")}: {clinic.distance_km.toFixed(1)} km
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl gap-2"
                    onClick={() => openInMaps(clinic)}
                  >
                    <Navigation className="w-4 h-4" />
                    {t("phc.directions")}
                  </Button>
                  {clinic.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-xl gap-2"
                      onClick={() => window.open(`tel:${clinic.phone}`)}
                    >
                      <Phone className="w-4 h-4" />
                      {t("phc.call")}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PHCNearby;
