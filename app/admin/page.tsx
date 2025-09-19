import VideoUploadForm from '@/components/VideoUploadForm';
import CategoryForm from '@/components/CategoryForm';
import VideoList from '@/components/VideoList';
import CategoryList from '@/components/CategoryList';

export default function AdminPage() {
  return (
    <div className="min-h-screen text-stone-600 bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Create Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Video Upload Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
            <VideoUploadForm />
          </div>

          {/* Category Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <CategoryForm />
          </div>
        </div>

        {/* Manage Sections */}
        <div className="space-y-12">
          {/* Video Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <VideoList />
          </div>

          {/* Category Management */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <CategoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
