export default function FeaturesSection() {
  const features = [
    "Real-time anomaly detection",
    "AI-driven fraud prevention",
    "Multi-agent security coordination",
    "Seamless integrations",
  ];

  return (
    <section className="py-20 bg-black text-white text-center">
      <h2 className="text-3xl font-bold mb-10">Features</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 px-6">
        {features.map((f, idx) => (
          <div key={idx} className="p-6 bg-gray-900 rounded-xl shadow-md hover:shadow-xl">
            {f}
          </div>
        ))}
      </div>
    </section>
  );
}