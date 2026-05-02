import { Link } from "wouter";
import { Activity, Mic, Globe, FileDown, ArrowRight, Check } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar */}
      <header className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">AutoSub</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900">Product</a>
            <a href="#workflow" className="hover:text-gray-900">How it Works</a>
            <a href="#features" className="hover:text-gray-900">Docs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/history" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/upload"
              className="bg-black text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Upload Video
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            New: V3 Engine is now live with 99.8% accuracy
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight mb-5">
            Generate Subtitles<br />
            Instantly{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              with AI
            </span>
          </h1>

          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
            Upload your video and watch as our neural engines transcribe, translate, and sync subtitles in seconds. Perfect for creators who value speed and precision.
          </p>

          <div className="flex items-center gap-3 mb-8">
            <Link
              href="/upload"
              className="bg-black text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              Upload Video
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/history"
              className="border border-gray-300 text-gray-700 font-medium px-6 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              View History
            </Link>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> No card required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> 10 free minutes
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-green-500" /> HD Support
            </span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative">
          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-950 flex items-end p-6 relative">
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white text-xs font-medium">AI Transcribing...</span>
              </div>
              <div className="w-full bg-black/60 backdrop-blur-sm rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-1">AutoSub helps us automate 90% of our subtitle workflow.</p>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-0.5">Processing Time</p>
                <p className="text-white font-bold text-lg">Under 12s</p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-blue-400 animate-pulse"
                    style={{ height: `${12 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust logos */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Empowering 500+ creators and enterprises
          </p>
          <div className="flex items-center justify-center flex-wrap gap-10 text-gray-400">
            {["GLOBALTECH", "STACKINC", "LUMINA", "COREFLOW"].map((name) => (
              <span key={name} className="text-sm font-bold tracking-wide opacity-60">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            Unmatched Performance
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight mb-4">
            Everything You Need to<br />Go Global
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Our advanced toolset handles the complex work so you can focus on storytelling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={Mic}
            title="AI Transcription"
            description="State-of-the-art neural networks to transcribe speech in over 50 languages with industry-leading accuracy."
          />
          <FeatureCard
            icon={Globe}
            title="Instant Translation"
            description="Reach a global audience with one click. Automatically translate your subtitles into 11+ languages while preserving tone."
          />
          <FeatureCard
            icon={FileDown}
            title="Advanced Export"
            description="Export in SRT format. Even burn-in subtitles directly into your video with custom font styling."
          />
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight mb-3">
              Your Workflow, Optimized.
            </h2>
            <p className="text-gray-500 mb-10 text-sm">
              From raw footage to fully captioned media in four simple steps.
            </p>

            <div className="space-y-6">
              {[
                {
                  n: 1,
                  title: "Upload Your Content",
                  desc: "Drag and drop any video format. We support MP4, MOV, and AVI up to 2GB.",
                },
                {
                  n: 2,
                  title: "AI Auto-Transcription",
                  desc: "Our engines process the audio track and generate perfectly timed text blocks.",
                },
                {
                  n: 3,
                  title: "Sync & Refine",
                  desc: "Fine-tune the results in our frame-synchronized subtitle editor.",
                },
              ].map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-gray-900 flex-shrink-0 mt-0.5">
                    {step.n}
                  </div>
                  <div>
                    <p className="font-semibold text-sm mb-0.5">{step.title}</p>
                    <p className="text-gray-500 text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center shadow-xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[3, 5, 8, 6, 4, 7, 5, 3].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-blue-400 rounded-full animate-pulse"
                    style={{ height: `${h * 4}px`, animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-gray-400 text-sm">Processing audio...</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gray-900 text-white text-center px-6">
        <h2 className="text-4xl font-extrabold mb-4">Ready to subtitle your first video?</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">
          Join the future of content production today. Your first 10 minutes are on us.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/upload"
            className="bg-white text-gray-900 font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition-colors"
          >
            Upload Video Now
          </Link>
          <Link
            href="/history"
            className="border border-gray-600 text-white font-medium px-8 py-3 rounded-md hover:bg-white/5 transition-colors"
          >
            View History
          </Link>
        </div>
        <p className="text-gray-500 text-xs mt-6">No credit card required. Cancel anytime.</p>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm">AutoSub</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed">
                Premium AI-powered subtitling and translation for creators, educators, and enterprise teams.
              </p>
            </div>

            {[
              { title: "Product", links: ["Features", "Security", "Pricing", "Changelog"] },
              { title: "Resources", links: ["Documentation", "API Reference", "Community", "Support"] },
              { title: "Company", links: ["About Us", "Careers", "Privacy Policy", "Terms of Service"] },
            ].map((col) => (
              <div key={col.title}>
                <p className="font-semibold text-sm mb-3">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-500 text-sm hover:text-gray-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-8 flex items-center justify-between text-xs text-gray-400">
            <span>© 2024 AutoSub. Created for global audiences.</span>
            <span>English</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
