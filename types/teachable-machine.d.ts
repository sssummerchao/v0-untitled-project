// Type definitions for Teachable Machine
interface Window {
  tf: any
  tmImage: {
    load: (modelURL: string, metadataURL: string) => Promise<any>
  }
}
