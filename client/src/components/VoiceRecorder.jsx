import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VoiceRecorder({ onAudioRecorded, onDiscard }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    setError(null);
    if (!consentChecked) {
      setError("Please check the consent box before starting your voice recording.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (onAudioRecorded) {
          onAudioRecorded(url, audioBlob, duration);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => {
          if (prev >= 120) { // Max 2 minutes
            stopRecording();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Mic access error:", err);
      setError("Microphone access was denied or is not supported in this browser. You can still type your request in text below.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release mic hardware
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const discardRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];
    if (onDiscard) onDiscard();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  return (
    <div className="bg-[#f2f4ee] p-5 rounded-2xl border border-[#eeeae1] space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-bold text-[#173b39] flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#087c70]" />
            Explain Your Problem Using Voice (Optional)
          </h4>
          <p className="text-xs text-[#697875] mt-1">
            If you have difficulty typing, record a brief voice message (up to 2 minutes) explaining your situation.
          </p>
        </div>
      </div>

      {/* Consent Checkbox */}
      <label className="flex items-start gap-2 text-xs text-[#526461] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => {
            setConsentChecked(e.target.checked);
            if (e.target.checked) setError(null);
          }}
          className="mt-0.5 rounded text-[#087c70] focus:ring-[#087c70]"
        />
        <span>
          I explicitly consent to record this voice explanation for the sole purpose of finding relevant assistance providers.
        </span>
      </label>

      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Recording controls */}
      <div className="flex items-center gap-3 pt-2">
        {!audioUrl ? (
          !isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="flex items-center gap-2 bg-[#087c70] hover:bg-[#075e56] text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs"
            >
              <Mic className="w-4 h-4" />
              Start Recording
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-semibold animate-pulse"
              >
                <Square className="w-4 h-4 fill-white" />
                Stop Recording ({formatTime(duration)})
              </button>
              <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                Recording live audio...
              </div>
            </div>
          )
        ) : (
          <div className="flex items-center gap-4 w-full bg-white p-3 rounded-xl border border-[#eeeae1]">
            <audio src={audioUrl} controls className="h-8 flex-1" />
            <button
              type="button"
              onClick={discardRecording}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Discard recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 text-xs text-[#087c70] font-semibold shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              Voice Note Attached
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
