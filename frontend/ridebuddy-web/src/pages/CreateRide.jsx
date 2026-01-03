function CreateRide() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md border rounded-lg p-6 shadow-sm">

        <h2 className="text-2xl font-bold text-center text-primary mb-6">
          Create Ride
        </h2>

        <input className="w-full mb-3 px-3 py-2 border rounded-md" placeholder="From" />
        <input className="w-full mb-3 px-3 py-2 border rounded-md" placeholder="To" />
        <input className="w-full mb-3 px-3 py-2 border rounded-md" type="datetime-local" />
        <input className="w-full mb-4 px-3 py-2 border rounded-md" placeholder="Available Seats" />

        <button className="w-full bg-primary hover:bg-primaryDark py-2 rounded-md font-semibold">
          Create Ride
        </button>

      </div>
    </div>
  );
}

export default CreateRide;
