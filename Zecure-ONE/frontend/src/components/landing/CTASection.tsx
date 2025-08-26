export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
      <p className="mb-8 text-lg">Join us today and experience the future of security intelligence.</p>
      <a
        href="/signup"
        className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
      >
        Get Started
      </a>
    </section>
  );
}