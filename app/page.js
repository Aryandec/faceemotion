"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Webcam from "react-webcam";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FiUpload } from "react-icons/fi";
import { MdOutlineCameraAlt } from "react-icons/md";
import { IoCheckmark } from "react-icons/io5";
import { FaArrowRotateLeft } from "react-icons/fa6";

export default function HomePage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setSelectedImage(imageSrc);
    }
  }, [webcamRef]);

  const resetImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleContinue = () => {
    console.log("Continue with image:", selectedImage);
    alert("Image ready! Continuing to next step...");
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
