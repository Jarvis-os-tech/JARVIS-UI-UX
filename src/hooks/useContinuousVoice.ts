import { useState, useEffect, useRef, useCallback } from "react";

// SpeechRecognition browser interface declarations
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface UseContinuousVoiceOptions {
  onCommand: (text: string) => Promise<string>;
  silenceThresholdMs?: number;
}

export function useContinuousVoice({
  onCommand,
  silenceThresholdMs = 1200,
}: UseContinuousVoiceOptions) {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastSpoken, setLastSpoken] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunningRef = useRef(false);
  const transcriptBufferRef = useRef("");
  const onCommandRef = useRef(onCommand);
  onCommandRef.current = onCommand;

  // Cleanup audio monitoring
  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Stop everything
  const stopVoice = useCallback(() => {
    isRunningRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsThinking(false);
    setIsSpeaking(false);
    setTranscript("");

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (e) {
        void e;
      }
      recognitionRef.current = null;
    }

    cleanupAudio();
  }, [cleanupAudio]);

  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    // Resume listening if active
    if (isRunningRef.current && recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        void e;
      }
    }
  }, []);

  // Process completed directive
  const handleProcessDirective = useCallback(async (spokenText: string) => {
    if (!spokenText.trim() || !isRunningRef.current) return;

    setIsListening(false);
    setIsThinking(true);
    setTranscript(spokenText);

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (e) {
      void e;
    }

    try {
      const replyText = await onCommandRef.current(spokenText);
      if (!isRunningRef.current) return;

      setIsThinking(false);

      // Speak reply
      if (typeof window !== "undefined" && "speechSynthesis" in window && replyText) {
        setIsSpeaking(true);
        setLastSpoken(replyText);

        // Strip markdown symbols for natural TTS speech
        const cleanText = replyText
          .replace(/[#*`_~[\]()]/g, " ")
          .replace(/https?:\/\/\S+/g, "")
          .replace(/\s+/g, " ")
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;

        // Select preferred voice if available (e.g. Google UK English Male, Daniel, or Samantha)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) =>
            v.name.includes("Daniel") ||
            v.name.includes("Natural") ||
            v.name.includes("Google UK English Male") ||
            (v.lang.startsWith("en") && !v.name.includes("Zira")),
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
          if (!isRunningRef.current) return;
          setIsSpeaking(false);
          setTranscript("");
          transcriptBufferRef.current = "";

          // Seamlessly resume listening in the loop
          setTimeout(() => {
            if (!isRunningRef.current) return;
            try {
              if (recognitionRef.current) {
                recognitionRef.current.start();
                setIsListening(true);
              }
            } catch (e) {
              void e;
            }
          }, 300);
        };

        utterance.onerror = () => {
          if (!isRunningRef.current) return;
          setIsSpeaking(false);
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
              setIsListening(true);
            }
          } catch (e) {
            void e;
          }
        };

        window.speechSynthesis.speak(utterance);
      } else {
        // If no speech synthesis, resume listening
        setTranscript("");
        transcriptBufferRef.current = "";
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      }
    } catch (err: unknown) {
      setIsThinking(false);
      setError(err instanceof Error ? err.message : String(err));
      if (isRunningRef.current && recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          void e;
        }
      }
    }
  }, []);

  // Initialize Audio Analyser for reactive visuals
  const initAudioAnalyser = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.mediaDevices) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const tick = () => {
        if (!isRunningRef.current) return;

        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          // Normalize to roughly 0 - 1
          const normalized = Math.min(1, Math.max(0, avg / 120));
          setAudioLevel(normalized);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      console.warn("Audio analyser initialization notice:", err);
      // Fallback synthetic wave pulse if mic permission rejected for audio node
    }
  }, []);

  // Synthesize reactive wave when speaking
  useEffect(() => {
    let speakInterval: ReturnType<typeof setInterval> | null = null;
    if (isSpeaking) {
      speakInterval = setInterval(() => {
        // Modulated random pulse between 0.2 and 0.85
        setAudioLevel(0.2 + Math.random() * 0.65);
      }, 90);
    }
    return () => {
      if (speakInterval) clearInterval(speakInterval);
    };
  }, [isSpeaking]);

  // Start continuous voice session
  const startVoice = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      setError(
        "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.",
      );
      return;
    }

    stopVoice();
    isRunningRef.current = true;
    setIsActive(true);
    setError(null);
    setTranscript("");
    transcriptBufferRef.current = "";

    initAudioAnalyser();

    const recognition = new SpeechRec();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let currentInterim = "";
      let currentFinal = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item.isFinal) {
          currentFinal += item[0].transcript + " ";
        } else {
          currentInterim += item[0].transcript;
        }
      }

      if (currentFinal) {
        transcriptBufferRef.current += currentFinal;
      }

      const activeText = (transcriptBufferRef.current + " " + currentInterim).trim();
      setTranscript(activeText);

      // Reset silence timer
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      if (activeText.length > 2) {
        silenceTimerRef.current = setTimeout(() => {
          if (isRunningRef.current && activeText.trim().length > 0) {
            handleProcessDirective(activeText.trim());
          }
        }, silenceThresholdMs);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === "no-speech") return;
      if (event.error === "aborted") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // If still running and not currently thinking or speaking, auto-restart
      if (isRunningRef.current && !isThinking && !isSpeaking) {
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          // Ignore restart collisions
          void e;
        }
      }
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setError("Failed to access microphone.");
    }
  }, [
    handleProcessDirective,
    initAudioAnalyser,
    silenceThresholdMs,
    stopVoice,
    isThinking,
    isSpeaking,
  ]);

  // Teardown on unmount
  useEffect(() => {
    return () => {
      stopVoice();
    };
  }, [stopVoice]);

  return {
    isActive,
    isListening,
    isThinking,
    isSpeaking,
    transcript,
    lastSpoken,
    audioLevel,
    error,
    startVoice,
    stopVoice,
    cancelSpeech,
  };
}
