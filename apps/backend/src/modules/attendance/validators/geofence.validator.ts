// ==========================================================================
// Geofence Validator - Valida ubicación dentro de geocerca
// ==========================================================================

interface GeoPoint {
  latitude: number;
  longitude: number;
}

interface GeoFenceData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // metros
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 */
function haversineDistance(point1: GeoPoint, point2: GeoPoint): number {
  const R = 6371000; // Radio de la Tierra en metros
  const dLat = toRad(point2.latitude - point1.latitude);
  const dLon = toRad(point2.longitude - point1.longitude);
  const lat1 = toRad(point1.latitude);
  const lat2 = toRad(point2.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export class GeofenceValidator {
  /**
   * Verifica si un punto está dentro de una geocerca
   */
  static isInside(
    point: GeoPoint,
    fence: GeoFenceData,
  ): { inside: boolean; distance: number } {
    const distance = haversineDistance(point, {
      latitude: fence.latitude,
      longitude: fence.longitude,
    });

    return {
      inside: distance <= fence.radius,
      distance: Math.round(distance * 100) / 100, // redondear a 2 decimales
    };
  }

  /**
   * Encuentra la geocerca más cercana para un punto
   */
  static findNearestFence(
    point: GeoPoint,
    fences: GeoFenceData[],
  ): { fence: GeoFenceData; distance: number } | null {
    if (fences.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const fence of fences) {
      const distance = haversineDistance(point, {
        latitude: fence.latitude,
        longitude: fence.longitude,
      });

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { fence, distance: Math.round(distance * 100) / 100 };
      }
    }

    return nearest;
  }

  /**
   * Obtiene la dirección aproximada (simplificada - reverse geocoding)
   */
  static async getAddress(
    latitude: number,
    longitude: number,
  ): Promise<string> {
    // TODO: Integrar con API de geocodificación (Google Maps, OpenStreetMap)
    // Por ahora retornamos coordenadas
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}
