export default function MetricsSection() {
  const metrics = [
    { value: "10K+", label: "Threats Detected" },
    { value: "99.9%", label: "Accuracy" },
    { value: "500+", label: "Enterprise Clients" },
    { value: "24/7", label: "Monitoring" },
  ];

  return (
    <section className="py-20 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-10">Our Impact</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="p-6 rounded-xl shadow bg-white">
            <div className="text-4xl font-extrabold text-blue-600">{m.value}</div>
            <p className="text-gray-700 mt-2">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}