import React, { useState, useRef } from "react";
import { createWorker } from "tesseract.js";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Upload,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Scan,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ExtractedData {
  passport_no?: string;
  passport_expiry?: string;
  name_en?: string;
  emirates_id?: string;
  emirates_id_expiry?: string;
  nationality?: string;
  card_no?: string;
  card_expiry?: string;
}

interface DocumentScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDataExtracted: (data: ExtractedData) => void;
  documentType: "passport" | "emirates_id" | "work_card";
}

export function DocumentScanner({
  isOpen,
  onClose,
  onDataExtracted,
  documentType,
}: DocumentScannerProps) {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraActive, setCameraActive] = useState(false);

  const documentTitles = {
    passport: "Passport",
    emirates_id: "Emirates ID",
    work_card: "Work Card",
  };

  // Start camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError("Camera access denied. Please use file upload instead.");
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        setImage(imageData);
        stopCamera();
      }
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Extract data from text based on document type
  const extractDataFromText = (text: string): ExtractedData => {
    const data: ExtractedData = {};

    if (documentType === "passport") {
      // Try to extract from MRZ (Machine Readable Zone) first - most reliable
      const mrzLines = text
        .split("\n")
        .filter(
          (line) =>
            line.replace(/[^A-Z0-9<]/g, "").length > 30 && line.includes("<")
        );

      let mrzExtracted = false;

      if (mrzLines.length >= 2) {
        const mrz1 = mrzLines[0].replace(/[^A-Z0-9<]/g, "");
        const mrz2 = mrzLines[1].replace(/[^A-Z0-9<]/g, "");

        // Extract name from MRZ line 1: P<SYRTAKALA<<BARAA<<<<<
        const mrzNameMatch = mrz1.match(/P<[A-Z]{3}([A-Z]+)<<([A-Z<]+)/);
        if (mrzNameMatch) {
          const surname = mrzNameMatch[1].replace(/</g, " ").trim();
          const givenNames = mrzNameMatch[2].replace(/</g, " ").trim();
          data.name_en = `${givenNames} ${surname}`.trim();
          mrzExtracted = true;
        }

        // Extract passport number from MRZ line 2
        // Format: N01206236 1 SYR 040630 3 M 261014 0 010107137 46 <<< 60
        const mrzPassportMatch = mrz2.match(/^([A-Z0-9]{9})/);
        if (mrzPassportMatch) {
          data.passport_no = mrzPassportMatch[1];
        }

        // Extract expiry date from MRZ line 2 (YYMMDD format at position ~21-26)
        const mrzExpiryMatch = mrz2.match(/[0-9]{6}[A-Z][0-9]{6}/);
        if (mrzExpiryMatch) {
          const expiryPart = mrzExpiryMatch[0].substring(7, 13); // Get YYMMDD after sex
          const year = parseInt(expiryPart.substring(0, 2));
          const month = expiryPart.substring(2, 4);
          const day = expiryPart.substring(4, 6);
          const fullYear = year > 50 ? 1900 + year : 2000 + year;
          data.passport_expiry = `${fullYear}-${month}-${day}`;
        }

        // Extract nationality from MRZ (3-letter country code)
        const countryCodeMatch = mrz2.match(
          /SYR|IND|PAK|BGD|PHL|EGY|JOR|LBN|SDN|AFG|NPL|LKA|IDN/
        );
        if (countryCodeMatch) {
          const countryMap: { [key: string]: string } = {
            SYR: "Syrian",
            IND: "Indian",
            PAK: "Pakistani",
            BGD: "Bangladeshi",
            PHL: "Filipino",
            EGY: "Egyptian",
            JOR: "Jordanian",
            LBN: "Lebanese",
            SDN: "Sudanese",
            AFG: "Afghan",
            NPL: "Nepali",
            LKA: "Sri Lankan",
            IDN: "Indonesian",
          };
          data.nationality =
            countryMap[countryCodeMatch[0]] || countryCodeMatch[0];
        }
      }

      // Fallback methods if MRZ extraction failed
      if (!data.passport_no) {
        // Look for "Passport No" label or pattern at top
        const passportLabelMatch = text.match(
          /(?:Passport\s*No|Passeport|رقم\s*الجواز)[:\s]*([A-Z0-9]{8,10})/i
        );
        if (passportLabelMatch) {
          data.passport_no = passportLabelMatch[1];
        } else {
          // Generic pattern: letter followed by 7-9 digits
          const passportMatch = text.match(/[A-Z][0-9]{7,9}/);
          if (passportMatch) data.passport_no = passportMatch[0];
        }
      }

      if (!data.passport_expiry) {
        // Extract expiry date (various formats: DD/MM/YYYY, DD-MM-YYYY, etc.)
        const datePatterns = [
          /\d{2}[\/\-]\d{2}[\/\-]\d{4}/g, // DD/MM/YYYY or DD-MM-YYYY
          /\d{2}\s?\w{3}\s?\d{4}/g, // DD MMM YYYY
          /\d{4}[\/\-]\d{2}[\/\-]\d{2}/g, // YYYY/MM/DD
        ];

        for (const pattern of datePatterns) {
          const matches = text.match(pattern);
          if (matches && matches.length > 0) {
            // Usually the last date is the expiry date
            const lastDate = matches[matches.length - 1];
            data.passport_expiry = formatDate(lastDate);
            break;
          }
        }
      }

      if (!data.name_en) {
        // Extract name from "Name:" label
        const nameLabelMatch = text.match(/Name\s*[:：]\s*([A-Z][a-zA-Z\s]+)/i);
        if (nameLabelMatch) {
          data.name_en = nameLabelMatch[1].trim();
        } else {
          // Look for surname/name pattern
          const surnameMatch = text.match(/(?:Surname|اللقب)[:\s]*([A-Z]+)/i);
          const nameMatch = text.match(/(?:Name|الاسم)[:\s]*([A-Z]+)/i);
          if (surnameMatch && nameMatch) {
            data.name_en = `${nameMatch[1]} ${surnameMatch[1]}`.trim();
          } else {
            // Generic: capital letters pattern
            const genericNameMatch = text.match(/[A-Z]{2,}\s+[A-Z]{2,}[\s\w]*/);
            if (genericNameMatch) data.name_en = genericNameMatch[0].trim();
          }
        }
      }

      if (!data.nationality) {
        // Extract nationality (common patterns)
        const nationalityKeywords = [
          "SYRIAN",
          "INDIAN",
          "PAKISTANI",
          "BANGLADESHI",
          "FILIPINO",
          "EGYPTIAN",
          "JORDANIAN",
          "LEBANESE",
          "SUDANESE",
          "AFGHAN",
          "NEPALI",
          "SRI LANKAN",
          "INDONESIAN",
        ];
        for (const nat of nationalityKeywords) {
          if (text.toUpperCase().includes(nat)) {
            data.nationality = nat;
            break;
          }
        }
      }
    } else if (documentType === "emirates_id") {
      // Extract Emirates ID number (784-YYYY-NNNNNNN-N format)
      const emiratesIdMatch = text.match(/784[-\s]?\d{4}[-\s]?\d{7}[-\s]?\d/);
      if (emiratesIdMatch) {
        data.emirates_id = emiratesIdMatch[0].replace(/\s/g, "");
      }

      // Extract expiry date
      const dateMatches = text.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/g);
      if (dateMatches && dateMatches.length > 0) {
        data.emirates_id_expiry = formatDate(
          dateMatches[dateMatches.length - 1]
        );
      }

      // Extract name - look for "Name:" label or the line after ID number
      let nameExtracted = false;

      // Method 1: Look for "Name:" or "Name :" pattern
      const nameWithLabelMatch = text.match(/Name\s*:\s*([A-Z][a-zA-Z\s]+)/i);
      if (nameWithLabelMatch && nameWithLabelMatch[1]) {
        data.name_en = nameWithLabelMatch[1].trim();
        nameExtracted = true;
      }

      // Method 2: If no label found, look for name between ID number and date of birth
      if (!nameExtracted) {
        const lines = text.split("\n");
        for (let i = 0; i < lines.length; i++) {
          // Find line with ID number
          if (lines[i].includes("784-")) {
            // Check next few lines for a name pattern (capital first letter, mixed case)
            for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
              const line = lines[j].trim();
              // Match name pattern: starts with capital, has spaces, 2-4 words
              const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/;
              const match = line.match(namePattern);
              if (
                match &&
                match[1] &&
                !line.includes("UNITED") &&
                !line.includes("ARAB") &&
                !line.includes("EMIRATES")
              ) {
                data.name_en = match[1].trim();
                nameExtracted = true;
                break;
              }
            }
            break;
          }
        }
      }

      // Method 3: Fallback - look for capital letters pattern but exclude common header words
      if (!nameExtracted) {
        const nameMatch = text.match(
          /[A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/
        );
        if (nameMatch) {
          const name = nameMatch[0].trim();
          // Exclude common header words
          if (
            !name.includes("United") &&
            !name.includes("Arab") &&
            !name.includes("Emirates") &&
            !name.includes("Federal") &&
            !name.includes("Authority") &&
            !name.includes("Card")
          ) {
            data.name_en = name;
          }
        }
      }

      // Extract nationality - look for "Nationality:" label or common patterns
      const nationalityWithLabelMatch = text.match(
        /Nationality\s*:\s*([A-Za-z\s]+(?:Republic|Kingdom|Emirates)?)/i
      );
      if (nationalityWithLabelMatch && nationalityWithLabelMatch[1]) {
        data.nationality = nationalityWithLabelMatch[1].trim();
      } else {
        // Common nationalities on UAE Emirates IDs
        const nationalityKeywords = [
          "Syrian Arab Republic",
          "Syrian",
          "Indian",
          "Pakistani",
          "Bangladeshi",
          "Filipino",
          "Egyptian",
          "Jordanian",
          "Lebanese",
          "Sudanese",
          "Afghan",
          "Nepali",
          "Sri Lankan",
          "Indonesian",
          "United Arab Emirates",
        ];
        for (const nat of nationalityKeywords) {
          if (text.includes(nat)) {
            data.nationality = nat;
            break;
          }
        }
      }
    } else if (documentType === "work_card") {
      // Extract work card number
      const cardMatch = text.match(/[A-Z0-9]{8,15}/);
      if (cardMatch) data.card_no = cardMatch[0];

      // Extract expiry date
      const dateMatches = text.match(/\d{2}[\/\-]\d{2}[\/\-]\d{4}/g);
      if (dateMatches && dateMatches.length > 0) {
        data.card_expiry = formatDate(dateMatches[dateMatches.length - 1]);
      }
    }

    return data;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (dateStr: string): string => {
    try {
      // Handle DD/MM/YYYY or DD-MM-YYYY
      const parts = dateStr.split(/[\/\-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts;
        if (year.length === 4) {
          return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Process image with OCR
  const processImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m: any) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(image);

      setExtractedText(text);
      const data = extractDataFromText(text);
      setExtractedData(data);

      await worker.terminate();
      setIsProcessing(false);
    } catch (err) {
      setError("Failed to process image. Please try again.");
      setIsProcessing(false);
    }
  };

  // Apply extracted data
  const applyData = () => {
    onDataExtracted(extractedData);
    handleClose();
  };

  // Close and cleanup
  const handleClose = () => {
    stopCamera();
    setImage(null);
    setExtractedText("");
    setExtractedData({});
    setError(null);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scan {documentTitles[documentType]}
          </DialogTitle>
          <DialogDescription>
            Take a photo or upload an image of the document. AI will extract the
            information automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Camera/Upload Controls */}
          {!image && !cameraActive && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={startCamera}
                variant="outline"
                className="h-24 flex-col gap-2"
              >
                <Camera className="w-8 h-8" />
                <span>Use Camera</span>
              </Button>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="h-24 flex-col gap-2"
              >
                <Upload className="w-8 h-8" />
                <span>Upload Image</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera View */}
          {cameraActive && (
            <div className="space-y-3">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg border"
              />
              <div className="flex gap-2">
                <Button onClick={capturePhoto} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Capture Photo
                </Button>
                <Button onClick={stopCamera} variant="outline">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Image Preview */}
          {image && !isProcessing && !extractedText && (
            <div className="space-y-3">
              <div className="relative">
                <img
                  src={image}
                  alt="Document"
                  className="w-full rounded-lg border"
                />
                <Button
                  onClick={() => setImage(null)}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <Button onClick={processImage} className="w-full" size="lg">
                <Scan className="w-4 h-4 mr-2" />
                Scan & Extract Data
              </Button>
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <Card className="p-6 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-lg font-medium mb-2">Processing Document...</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {progress}% complete
              </p>
            </Card>
          )}

          {/* Results - Editable Fields */}
          {extractedText && !isProcessing && (
            <div className="space-y-4">
              <Card className="p-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    Data Extracted - Review & Edit Before Applying
                  </span>
                </div>

                <div className="space-y-3">
                  {Object.entries(extractedData).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">
                        {key.replace(/_/g, " ")}
                      </Label>
                      <Input
                        value={(value as string) || ""}
                        onChange={(e) =>
                          setExtractedData({
                            ...extractedData,
                            [key]: e.target.value,
                          })
                        }
                        placeholder={`Enter ${key.replace(/_/g, " ")}`}
                        className="bg-white dark:bg-gray-800 border-green-300 dark:border-green-700"
                      />
                    </div>
                  ))}
                </div>

                <p className="text-xs text-green-700 dark:text-green-400 mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  You can edit the extracted values above before applying
                </p>
              </Card>

              {/* Show raw extracted text in details */}
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                  View Raw Text
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40">
                  {extractedText}
                </pre>
              </details>

              <div className="flex gap-2">
                <Button onClick={applyData} className="flex-1" size="lg">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Apply Data to Form
                </Button>
                <Button
                  onClick={() => {
                    setImage(null);
                    setExtractedText("");
                    setExtractedData({});
                  }}
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">{error}</span>
              </div>
            </Card>
          )}

          {/* Tips */}
          {!image && !cameraActive && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">
                📸 Tips for Best Results:
              </p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-disc list-inside">
                <li>Ensure good lighting</li>
                <li>Hold camera steady and parallel to document</li>
                <li>Avoid shadows and glare</li>
                <li>Capture the entire document</li>
                <li>Make sure text is clear and readable</li>
              </ul>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
