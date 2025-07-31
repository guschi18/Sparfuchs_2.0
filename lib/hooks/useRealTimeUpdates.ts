'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface RealtimeState {
  isConnected: boolean;
  isStreaming: boolean;
  hasError: boolean;
  errorMessage: string;
  lastUpdateTime: Date | null;
}

export interface StreamChunk {
  content?: string;
  warning?: string;
  done?: boolean;
  error?: string;
}

export function useRealTimeUpdates() {
  const [realtimeState, setRealtimeState] = useState<RealtimeState>({
    isConnected: false,
    isStreaming: false,
    hasError: false,
    errorMessage: '',
    lastUpdateTime: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update realtime state
  const updateState = useCallback((updates: Partial<RealtimeState>) => {
    setRealtimeState(prev => ({
      ...prev,
      ...updates,
      lastUpdateTime: new Date(),
    }));
  }, []);

  // Start streaming
  const startStream = useCallback(async (
    url: string,
    requestBody: any,
    onChunk: (chunk: StreamChunk) => void,
    onComplete?: () => void,
    onError?: (error: string) => void
  ) => {
    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear existing timeout
    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    updateState({
      isStreaming: true,
      isConnected: false,
      hasError: false,
      errorMessage: '',
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      updateState({ isConnected: true });

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream available');
      }

      // Set stream timeout (60 seconds)
      streamTimeoutRef.current = setTimeout(() => {
        abortControllerRef.current?.abort();
        updateState({
          hasError: true,
          errorMessage: 'Stream timeout - Verbindung wurde beendet',
          isStreaming: false,
          isConnected: false,
        });
        onError?.('Stream timeout');
      }, 60000);

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          onComplete?.();
          break;
        }

        // Decode chunk
        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        
        // Keep incomplete line in buffer
        buffer = lines.pop() || '';

        // Process complete lines
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              onChunk(data);

              // Update state based on chunk
              if (data.done) {
                updateState({
                  isStreaming: false,
                  isConnected: false,
                });
                onComplete?.();
                return;
              }

              if (data.error) {
                updateState({
                  hasError: true,
                  errorMessage: data.error,
                  isStreaming: false,
                  isConnected: false,
                });
                onError?.(data.error);
                return;
              }

            } catch (parseError) {
              console.error('Failed to parse stream chunk:', parseError);
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Stream was cancelled
        updateState({
          isStreaming: false,
          isConnected: false,
        });
        return;
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown streaming error';
      updateState({
        hasError: true,
        errorMessage,
        isStreaming: false,
        isConnected: false,
      });
      onError?.(errorMessage);
    } finally {
      // Clear timeout
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
        streamTimeoutRef.current = null;
      }
    }
  }, [updateState]);

  // Stop streaming
  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (streamTimeoutRef.current) {
      clearTimeout(streamTimeoutRef.current);
      streamTimeoutRef.current = null;
    }

    updateState({
      isStreaming: false,
      isConnected: false,
    });
  }, [updateState]);

  // Check connection status
  const checkConnection = useCallback(async (url: string = '/api/chat'): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const isConnected = response.ok;
      updateState({ 
        isConnected,
        hasError: !isConnected,
        errorMessage: isConnected ? '' : 'Verbindung zum Server fehlgeschlagen',
      });

      return isConnected;
    } catch (error) {
      updateState({
        isConnected: false,
        hasError: true,
        errorMessage: 'Netzwerkfehler - Server nicht erreichbar',
      });
      return false;
    }
  }, [updateState]);

  // Retry connection
  const retryConnection = useCallback(async (
    url: string,
    requestBody: any,
    onChunk: (chunk: StreamChunk) => void,
    onComplete?: () => void,
    onError?: (error: string) => void,
    maxRetries: number = 3
  ) => {
    let retryCount = 0;

    const attemptStream = async (): Promise<void> => {
      try {
        await startStream(url, requestBody, onChunk, onComplete, onError);
      } catch (error) {
        retryCount++;
        
        if (retryCount < maxRetries) {
          // Wait before retry (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 5000);
          
          updateState({
            errorMessage: `Verbindungsfehler - Wiederhole Versuch ${retryCount}/${maxRetries} in ${delay/1000}s...`,
          });

          setTimeout(() => attemptStream(), delay);
        } else {
          const errorMessage = `Verbindung fehlgeschlagen nach ${maxRetries} Versuchen`;
          updateState({
            hasError: true,
            errorMessage,
            isStreaming: false,
            isConnected: false,
          });
          onError?.(errorMessage);
        }
      }
    };

    await attemptStream();
  }, [startStream, updateState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    realtimeState,
    startStream,
    stopStream,
    checkConnection,
    retryConnection,
  };
}