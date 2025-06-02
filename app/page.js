"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCameraAlt } from "react-icons/md";
import { IoCheckmark } from "react-icons/io5";
import { FaArrowRotateLeft } from "react-icons/fa6";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [file, setFile] = useState(null);
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  const router = useRouter();

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    setFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
    console.log("File uploaded:", file);
    console.log("Selected image:", selectedImage);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
    }
  }, [webcamRef]);

  const resetImage = () => {
    setSelectedImage(null);
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const base64ToBlob = (base64) => {
    const byteString = atob(base64.split(",")[1]);
    const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  const handleContinue = async () => {
    console.log("Continue with image:", selectedImage);

    let imageToSend = file;

    if (!file && selectedImage?.startsWith("data:image")) {
      const blob = base64ToBlob(selectedImage);
      imageToSend = new File([blob], "webcam.jpg", { type: "image/jpeg" });
    }

    if (!imageToSend) {
      alert("Please upload or capture an image.");
      return;
    }

    const formData = new FormData();
    // ✅ This MUST be named exactly "image" to match backend
    formData.append("image", imageToSend);

    // Log the FormData content
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await fetch("/api/emotion", {
        method: "POST",
        body: formData,
      });

      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);

      if (!response.ok) {
        try {
          const error = JSON.parse(rawResponse);
          console.error("API Error:", error);
          alert(error.error || "Error detecting emotion");
        } catch (parseError) {
          console.error("Unexpected Response Format:", rawResponse);
          alert("Unexpected response from the server");
        }
        return;
      }

      const result = JSON.parse(rawResponse);
      console.log("API Result:", result);

      router.push(
        `/results/emotionResult?emotion=${encodeURIComponent(
          JSON.stringify(result)
        )}`
      );
    } catch (error) {
      console.error("Fetch Error:", error);
      alert("Error uploading the image");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Image Capture
          </h1>
          <p className="text-slate-600">
            Upload an image from your device or capture one with your camera
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Select Image Source</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedImage ? (
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="upload"
                    className="flex items-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                  <TabsTrigger
                    value="camera"
                    className="flex items-center gap-2"
                  >
                    <MdOutlineCameraAlt className="w-4 h-4" />
                    Camera
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-6">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                    <FiUpload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">
                      Upload Image
                    </h3>
                    <p className="text-slate-500 mb-4">
                      Choose an image file from your device
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Choose File
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="camera" className="mt-6">
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-slate-900">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-64 object-cover"
                        videoConstraints={{
                          width: 1280,
                          height: 720,
                          facingMode: "user",
                        }}
                      />
                    </div>
                    <Button
                      onClick={capturePhoto}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <MdOutlineCameraAlt className="w-5 h-5 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6">
                <div className="relative rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={selectedImage || "/placeholder.svg"}
                    alt="Selected image"
                    width={600}
                    height={400}
                    className="w-full h-64 object-cover"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={resetImage}
                    variant="outline"
                    className="flex-1"
                  >
                    <FaArrowRotateLeft className="w-4 h-4 mr-2" />
                    Choose Different Image
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <IoCheckmark className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedImage && (
          <div className="mt-6 text-center">
            <p className="text-slate-600">
              ✅ Image selected successfully! Click "Continue" to proceed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
