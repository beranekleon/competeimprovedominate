import { useMemo } from 'react';
import {
  buildExpansionFeatureFromTrack,
  isClosedTrack,
  mergePolygonFeatures,
  toCoordinateTrack,
  toMapPolygonRings,
  toPolygonFeature,
} from '../utils/territory.utils';

const DEFAULT_CLOSURE_DISTANCE_METERS = 10;

/**
 * useTerritoryGeometry
 * Builds map-ready track and territory geometry from persisted sessions.
 */
export function useTerritoryGeometry({
  sessions,
  closureDistanceMeters = DEFAULT_CLOSURE_DISTANCE_METERS,
}) {
  const sessionTracks = useMemo(
    () => sessions.map((session) => toCoordinateTrack(session.locations)).filter((track) => track.length >= 2),
    [sessions]
  );

  const mergedTerritoryFeature = useMemo(() => {
    const closedTrackFeatures = sessionTracks
      .filter((track) => isClosedTrack(track, closureDistanceMeters))
      .map((track) => toPolygonFeature(track))
      .filter(Boolean);

    let merged = mergePolygonFeatures(closedTrackFeatures);

    if (!merged) {
      return null;
    }

    const openTracks = sessionTracks.filter(
      (track) => !isClosedTrack(track, closureDistanceMeters) && track.length >= 3
    );

    for (let i = 0; i < openTracks.length; i += 1) {
      const territoryRings = toMapPolygonRings(merged);
      const expansionFeature = buildExpansionFeatureFromTrack(
        openTracks[i],
        territoryRings,
        closureDistanceMeters
      );

      if (!expansionFeature) {
        continue;
      }

      const expanded = mergePolygonFeatures([merged, expansionFeature]);
      if (expanded) {
        merged = expanded;
      }
    }

    return merged;
  }, [closureDistanceMeters, sessionTracks]);

  const mergedTerritoryRings = useMemo(
    () => toMapPolygonRings(mergedTerritoryFeature),
    [mergedTerritoryFeature]
  );

  const territoryCoordinates = useMemo(
    () => sessionTracks.flat().map((point) => ({ latitude: point.latitude, longitude: point.longitude })),
    [sessionTracks]
  );

  return {
    sessionTracks,
    mergedTerritoryRings,
    territoryCoordinates,
  };
}
