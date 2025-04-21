import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function DownloadInstructions() {
  return (
    <Alert className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>About SVG Downloads</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          Your pattern will download as an SVG file, which is a high-quality vector format. To use your SVG:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Open with a web browser like Chrome, Firefox, or Safari</li>
          <li>Edit in design software like Adobe Illustrator, Inkscape (free), or Affinity Designer</li>
          <li>
            Convert to PNG or JPG using online tools like{" "}
            <a
              href="https://convertio.co/svg-png/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Convertio
            </a>{" "}
            or{" "}
            <a
              href="https://cloudconvert.com/svg-to-png"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              CloudConvert
            </a>
          </li>
        </ul>
      </AlertDescription>
    </Alert>
  )
}
