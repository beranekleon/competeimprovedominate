import union from '@turf/union';
import { featureCollection, polygon as turfPolygon } from '@turf/helpers';

const TERRITORY_CLOSURE_DISTANCE_METERS = 10;

export const isValidCoordinate = (point) => (
  point
  && typeof point.latitude === 'number'
  && typeof point.longitude === 'number'
);

export const toCoordinateTrack = (locations) => {
  const seen = new Set();

  return (Array.isArray(locations) ? locations : [])
    .filter(isValidCoordinate)
    .filter((point) => {
      const key = `${point.latitude.toFixed(6)}:${point.longitude.toFixed(6)}`;
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export const distanceMeters = (a, b) => {
  const earthRadiusMeters = 6371000;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * earthRadiusMeters * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export const isClosedTrack = (
  coordinates,
  thresholdMeters = TERRITORY_CLOSURE_DISTANCE_METERS
) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return false;
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];
  return distanceMeters(first, last) <= thresholdMeters;
};

export const toPolygonFeature = (coordinates) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    return null;
  }

  const ring = coordinates.map((point) => [point.longitude, point.latitude]);
  const first = ring[0];
  const last = ring[ring.length - 1];
  const isClosed = first[0] === last[0] && first[1] === last[1];

  if (!isClosed) {
    ring.push([first[0], first[1]]);
  }

  return turfPolygon([ring]);
};

export const mergePolygonFeatures = (features) => {
  if (!features.length) {
    return null;
  }

  let merged = features[0];
  for (let i = 1; i < features.length; i += 1) {
    const next = features[i];
    let unionResult = null;

    try {
      unionResult = union(featureCollection([merged, next]));
    } catch (error) {
      unionResult = union(merged, next);
    }

    if (unionResult) {
      merged = unionResult;
    }
  }

  return merged;
};

export const toMapPolygonRings = (feature) => {
  if (!feature || !feature.geometry) {
    return [];
  }

  const { type, coordinates } = feature.geometry;

  if (type === 'Polygon') {
    return [coordinates[0].map(([longitude, latitude]) => ({ latitude, longitude }))];
  }

  if (type === 'MultiPolygon') {
    return coordinates.map((polygonRing) => (
      polygonRing[0].map(([longitude, latitude]) => ({ latitude, longitude }))
    ));
  }

  return [];
};

const normalizeRing = (ring) => {
  if (!Array.isArray(ring) || ring.length === 0) {
    return [];
  }

  const normalized = [...ring];
  if (normalized.length < 2) {
    return normalized;
  }

  const first = normalized[0];
  const last = normalized[normalized.length - 1];
  if (first.latitude === last.latitude && first.longitude === last.longitude) {
    normalized.pop();
  }

  return normalized;
};

const pathLengthMeters = (points) => {
  if (!Array.isArray(points) || points.length < 2) {
    return 0;
  }

  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += distanceMeters(points[i - 1], points[i]);
  }

  return total;
};

const findNearestVertexIndex = (ring, point, thresholdMeters) => {
  if (!Array.isArray(ring) || ring.length === 0 || !isValidCoordinate(point)) {
    return null;
  }

  let bestIndex = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (let i = 0; i < ring.length; i += 1) {
    const distance = distanceMeters(ring[i], point);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  if (bestDistance > thresholdMeters) {
    return null;
  }

  return bestIndex;
};

const buildRingPath = (ring, startIndex, endIndex, forward) => {
  if (!ring.length) {
    return [];
  }

  const result = [ring[startIndex]];
  let index = startIndex;

  while (index !== endIndex) {
    index = forward ? (index + 1) % ring.length : (index - 1 + ring.length) % ring.length;
    result.push(ring[index]);

    if (result.length > ring.length + 1) {
      break;
    }
  }

  return result;
};

const dedupeSequentialPoints = (points) => (
  points.filter((point, index) => {
    if (index === 0) {
      return true;
    }

    const prev = points[index - 1];
    return point.latitude !== prev.latitude || point.longitude !== prev.longitude;
  })
);

export const buildExpansionFeatureFromTrack = (track, territoryRings, thresholdMeters) => {
  if (!Array.isArray(track) || track.length < 3 || !Array.isArray(territoryRings) || !territoryRings.length) {
    return null;
  }

  const trackStart = track[0];
  const trackEnd = track[track.length - 1];

  for (let i = 0; i < territoryRings.length; i += 1) {
    const ring = normalizeRing(territoryRings[i]);
    if (ring.length < 3) {
      continue;
    }

    const startIdx = findNearestVertexIndex(ring, trackStart, thresholdMeters);
    const endIdx = findNearestVertexIndex(ring, trackEnd, thresholdMeters);

    if (startIdx === null || endIdx === null) {
      continue;
    }

    const forwardBoundary = buildRingPath(ring, endIdx, startIdx, true);
    const backwardBoundary = buildRingPath(ring, endIdx, startIdx, false);
    const chosenBoundary = pathLengthMeters(forwardBoundary) <= pathLengthMeters(backwardBoundary)
      ? forwardBoundary
      : backwardBoundary;

    const candidate = dedupeSequentialPoints([...track, ...chosenBoundary]);
    if (candidate.length < 3) {
      continue;
    }

    const polygonFeature = toPolygonFeature(candidate);
    if (polygonFeature) {
      return polygonFeature;
    }
  }

  return null;
};
