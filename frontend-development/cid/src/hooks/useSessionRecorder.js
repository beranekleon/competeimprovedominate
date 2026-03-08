import { useCallback, useEffect, useRef, useState } from 'react';
import userService from '../services/user.service';
import { isValidCoordinate } from '../utils/territory.utils';

const DEFAULT_SAMPLE_INTERVAL_MS = 2000;

/**
 * useSessionRecorder
 * Handles recording lifecycle, location sampling and session persistence.
 */
export function useSessionRecorder({
  userEmail,
  location,
  onSessionSaved,
  onSaveError,
  sampleIntervalMs = DEFAULT_SAMPLE_INTERVAL_MS,
}) {
  const [isRunning, setIsRunning] = useState(false);
  const [recordingLoading, setRecordingLoading] = useState(false);
  const [liveTrack, setLiveTrack] = useState([]);

  const sessionStartTimeRef = useRef(null);
  const gpsTrackRef = useRef([]);
  const latestLocationRef = useRef(null);

  useEffect(() => {
    latestLocationRef.current = location || null;
  }, [location]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const pushCurrentLocation = () => {
      const current = latestLocationRef.current;

      if (!isValidCoordinate(current)) {
        return;
      }

      const sample = {
        latitude: current.latitude,
        longitude: current.longitude,
        accuracy: typeof current.accuracy === 'number' ? current.accuracy : null,
        speed: typeof current.speed === 'number' ? current.speed : null,
        heading: typeof current.heading === 'number' ? current.heading : null,
        timestamp: new Date().toISOString(),
      };

      gpsTrackRef.current.push(sample);
      setLiveTrack([...gpsTrackRef.current]);
    };

    pushCurrentLocation();
    const intervalId = setInterval(pushCurrentLocation, sampleIntervalMs);

    return () => clearInterval(intervalId);
  }, [isRunning, sampleIntervalMs]);

  const resetCurrentRecording = useCallback(() => {
    gpsTrackRef.current = [];
    setLiveTrack([]);
    sessionStartTimeRef.current = null;
  }, []);

  const startRecording = useCallback(() => {
    resetCurrentRecording();
    sessionStartTimeRef.current = Date.now();
    setIsRunning(true);
  }, [resetCurrentRecording]);

  const stopRecording = useCallback(async () => {
    if (!sessionStartTimeRef.current) {
      setIsRunning(false);
      return;
    }

    const stopTime = Date.now();
    const durationMs = Math.max(0, stopTime - sessionStartTimeRef.current);

    const session = {
      startedAt: new Date(sessionStartTimeRef.current).toISOString(),
      stoppedAt: new Date(stopTime).toISOString(),
      durationMs,
      durationSeconds: Math.floor(durationMs / 1000),
      locations: gpsTrackRef.current,
    };

    try {
      setRecordingLoading(true);
      await userService.saveSession(userEmail, session);
      setIsRunning(false);
      resetCurrentRecording();

      if (typeof onSessionSaved === 'function') {
        await onSessionSaved(session);
      }
    } catch (error) {
      if (typeof onSaveError === 'function') {
        onSaveError(error);
      }
    } finally {
      setRecordingLoading(false);
    }
  }, [onSaveError, onSessionSaved, resetCurrentRecording, userEmail]);

  const toggleRecording = useCallback(async () => {
    if (!isRunning) {
      startRecording();
      return;
    }

    await stopRecording();
  }, [isRunning, startRecording, stopRecording]);

  return {
    isRunning,
    recordingLoading,
    liveTrack,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
