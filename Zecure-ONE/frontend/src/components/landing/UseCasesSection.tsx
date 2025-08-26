export default function UseCasesSection() {
  const cases = [
    "Fraud Detection in FinTech",
    "Intrusion Prevention in Cloud Platforms",
    "Threat Monitoring for Enterprises",
    "Adaptive Security for Startups",
  ];

  return (
    <section className="py-20 bg-white text-center">
      <h2 className="text-3xl font-bold mb-10">Use Cases</h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {cases.map((c, idx) => (
          <div key={idx} className="p-6 bg-gray-100 rounded-xl shadow hover:bg-gray-200 transition">
            {c}
          </div>
        ))}
      </div>
    </section>
  );
}