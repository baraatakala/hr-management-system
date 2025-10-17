import * as React from "react";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface VoiceInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onVoiceInput?: (text: string) => void;
  voiceLanguage?: string; // 'en-US', 'ar-SA', etc.
}

const VoiceInput = React.forwardRef<HTMLInputElement, VoiceInputProps>(
  (
    { className, type, onVoiceInput, voiceLanguage = "en-US", ...props },
    ref
  ) => {
    const [isListening, setIsListening] = React.useState(false);
    const [recognition, setRecognition] = React.useState<any>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      // Check if browser supports Web Speech API
      if (
        typeof window !== "undefined" &&
        ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
      ) {
        const SpeechRecognition =
          (window as any).webkitSpeechRecognition ||
          (window as any).SpeechRecognition;
        const recognitionInstance = new SpeechRecognition();

        recognitionInstance.continuous = false; // Stop after one phrase
        recognitionInstance.interimResults = false; // Only final results
        recognitionInstance.lang = voiceLanguage;

        recognitionInstance.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;

          // Update input value
          if (inputRef.current) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
              window.HTMLInputElement.prototype,
              "value"
            )?.set;
            nativeInputValueSetter?.call(inputRef.current, transcript);

            // Trigger onChange event
            const changeEvent = new Event("input", { bubbles: true });
            inputRef.current.dispatchEvent(changeEvent);
          }

          // Call callback if provided
          if (onVoiceInput) {
            onVoiceInput(transcript);
          }

          setIsListening(false);
        };

        recognitionInstance.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }

      return () => {
        if (recognition) {
          recognition.stop();
        }
      };
    }, [voiceLanguage, onVoiceInput]);

    const toggleListening = () => {
      if (!recognition) {
        alert(
          "Voice input is not supported in your browser. Please try Chrome or Edge."
        );
        return;
      }

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    };

    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-12 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={inputRef}
          {...props}
        />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className={cn(
            "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0",
            isListening && "text-red-500 animate-pulse"
          )}
          onClick={toggleListening}
          title={isListening ? "Stop listening" : "Click to speak"}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);

VoiceInput.displayName = "VoiceInput";

export { VoiceInput };
