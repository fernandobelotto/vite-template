import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Download, AlertCircle } from "lucide-react";

export const VTTDownloader = () => {
  const [baseURL, setBaseURL] = useState("");
  const [paths, setPaths] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [totalFiles, setTotalFiles] = useState(0);
  const [downloadedFiles, setDownloadedFiles] = useState(0);

  const downloadFile = async (fileName: string, url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
      return true;
    } catch (error) {
      console.error(`Error downloading ${url}:`, error);
      return false;
    }
  };

  const handleDownload = async () => {
    try {
      setError("");
      setDownloading(true);
      setProgress(0);
      setDownloadedFiles(0);

      // Parse paths from textarea
      const pathsList = paths
        .split("\n")
        .map((path) => path.trim())
        .filter((path) => path && !path.startsWith("//"));

      setTotalFiles(pathsList.length);

      for (let i = 0; i < pathsList.length; i++) {
        const path = pathsList[i];
        const fileName = `${i}-${path.split("/").filter(Boolean).pop()}.vtt`;
        const fileURL = baseURL + fileName;

        const success = await downloadFile(fileName, fileURL);
        if (success) {
          setDownloadedFiles((prev) => prev + 1);
          setProgress(((i + 1) * 100) / pathsList.length);
        }

        // Add a small delay between downloads to prevent overwhelming the browser
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">VTT File Downloader</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Base URL</label>
          <Input
            placeholder="https://example.com/assets/courses/"
            value={baseURL}
            onChange={(e) => setBaseURL(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Paths (one per line)
          </label>
          <Textarea
            placeholder="/courses/example/lesson-1/
/courses/example/lesson-2/"
            value={paths}
            onChange={(e) => setPaths(e.target.value)}
            className="h-64"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {downloading && (
          <div className="space-y-2">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-gray-600">
              Downloaded: {downloadedFiles} / {totalFiles} files
            </p>
          </div>
        )}

        <Button
          onClick={handleDownload}
          disabled={!baseURL || !paths || downloading}
          className="w-full"
        >
          <Download className="mr-2 h-4 w-4" />
          {downloading ? "Downloading..." : "Download VTT Files"}
        </Button>
      </div>
    </div>
  );
};
