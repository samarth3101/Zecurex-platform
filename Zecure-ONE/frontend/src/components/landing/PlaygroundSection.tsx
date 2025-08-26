export default function PlaygroundSection() {
  return (
    <section className="py-20 bg-black text-white text-center">
      <h2 className="text-3xl font-bold mb-6">Try the Playground</h2>
      <p className="mb-8 text-lg">Experiment with our models and see them in action.</p>
      <iframe
        src="https://your-playground-link.com"
        className="w-full h-96 rounded-xl border border-gray-700"
        title="Playground"
      ></iframe>
    </section>
  );
}