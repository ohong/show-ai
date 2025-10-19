import { VideoUpload } from "../../components/VideoUpload";

export default function UploadVideoPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Upload Video
            </h1>
            <p className="text-lg text-gray-600">
              Upload your screen recording to convert it into an executable AI skill
            </p>
          </div>
          
          <VideoUpload />
        </div>
      </div>
    </main>
  );
}
