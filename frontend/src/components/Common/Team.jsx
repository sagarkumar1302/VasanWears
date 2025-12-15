const Team = () => {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <h2 className="text-center text-3xl font-bold mb-10">
          Meet Our Team
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {Array(8).fill(0).map((_, i) => (
            <div key={i} className="text-center">
              <img
                src="/images/team.jpg"
                className="rounded-full mx-auto mb-3"
              />
              <h4 className="font-semibold">Team Member</h4>
              <p className="text-sm text-gray-500">Designer</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
