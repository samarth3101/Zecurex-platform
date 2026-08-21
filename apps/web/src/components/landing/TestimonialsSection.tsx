export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Jane Doe",
      role: "CISO, FinTech Corp",
      text: "Zecure helped us stop fraud attempts before they even started.",
    },
    {
      name: "John Smith",
      role: "CTO, CloudWorks",
      text: "The AI-driven monitoring is a game-changer for enterprise security.",
    },
  ];

  return (
    <section className="py-20 bg-gray-900 text-white text-center">
      <h2 className="text-3xl font-bold mb-10">What Our Clients Say</h2>
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        {testimonials.map((t, idx) => (
          <div key={idx} className="p-6 bg-gray-800 rounded-xl shadow">
            <p className="italic mb-4">"{t.text}"</p>
            <div className="font-semibold">{t.name}</div>
            <div className="text-gray-400 text-sm">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}