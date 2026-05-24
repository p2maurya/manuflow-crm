function App() {
  return (
    <div className="min-h-screen flex">

      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-5">
        <h1 className="text-2xl font-bold mb-10">
          ManuFlow CRM
        </h1>

        <ul className="space-y-4">
          <li className="hover:text-blue-400 cursor-pointer">
            Dashboard
          </li>

          <li className="hover:text-blue-400 cursor-pointer">
            Leads
          </li>

          <li className="hover:text-blue-400 cursor-pointer">
            Clients
          </li>

          <li className="hover:text-blue-400 cursor-pointer">
            Team
          </li>

          <li className="hover:text-blue-400 cursor-pointer">
            Settings
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* Navbar */}
        <div className="bg-white rounded-xl shadow-md p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Dashboard
          </h2>

          <button className="bg-black text-white px-5 py-2 rounded-lg">
            Logout
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-6 mt-8">

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500">
              Total Leads
            </h3>

            <p className="text-3xl font-bold mt-2">
              120
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500">
              Active Clients
            </h3>

            <p className="text-3xl font-bold mt-2">
              45
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-gray-500">
              Revenue
            </h3>

            <p className="text-3xl font-bold mt-2">
              ₹85K
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;