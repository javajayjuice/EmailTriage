import MainLayout from "@/components/layout/MainLayout";
import Navbar from "@/components/layout/Navbar";
import Link from "next/link";

export default function Home() {
  return (

    <MainLayout>

    

      
    <div className="max-h-[full|screen|fit] bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navbar */}
      {/* <Navbar /> */}

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl font-extrabold text-gray-800 sm:text-5xl">
          We offer modern solutions for growing your business
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          We are a team of talented designers making websites with modern tools.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/tickets">
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700">
              Get Started →
            </button>
          </Link>
          <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-lg hover:bg-gray-300">
            Watch Video
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            Why Choose Us?
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Feature 1</h3>
              <p className="mt-2 text-gray-600">
                Description of the first feature that highlights its benefits.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Feature 2</h3>
              <p className="mt-2 text-gray-600">
                Description of the second feature that highlights its benefits.
              </p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-gray-800">Feature 3</h3>
              <p className="mt-2 text-gray-600">
                Description of the third feature that highlights its benefits.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Features Section */}
      {/* <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-light text-gray-800 text-center">
            We are here to deliver for everyone!
          </h2>
          <div className="my-0 grid grid-cols-1 gap-8">

          </div>
        </div>
      </div> */}

      {/* Footer */}
      {/* <footer className="bg-blue-600 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>© 2025 Your Company. All rights reserved.</p>
        </div>
      </footer> */}
    </div>
    </MainLayout>
  );
}
