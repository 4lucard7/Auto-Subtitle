import { Link } from "wouter";
import { Upload, Mic, Languages, FileDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-24 px-6 relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-sm font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          System Online
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl mb-6">
          Precision Subtitling. <br />
          <span className="text-muted-foreground">Zero Friction.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
          The professional toolkit for content creators. Upload a video, let our models transcribe and translate, and export your SRT instantly. 
        </p>

        <div className="flex items-center gap-4">
          <Button asChild size="lg" className="font-mono text-base h-12 px-8 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <Link href="/upload">
              Initialize Job <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-mono text-base h-12 px-8 border-border">
            <Link href="/history">
              View History
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/50 border-y border-border px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border border-border bg-card flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-mono">Neural Transcription</h3>
            <p className="text-muted-foreground leading-relaxed">
              High-accuracy speech-to-text models process your audio with perfect word-level timing and speaker separation.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-mono">10+ Languages</h3>
            <p className="text-muted-foreground leading-relaxed">
              Seamlessly translate your subtitles into major global languages including French, Spanish, Japanese, and Mandarin.
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border bg-card flex flex-col items-start text-left">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <FileDown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-mono">Instant Export</h3>
            <p className="text-muted-foreground leading-relaxed">
              Download standard SRT files for both your original and translated languages, ready to import into Premiere or Final Cut.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold font-mono mb-12">Workflow</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex-1 p-4">
            <div className="text-primary font-mono text-xl mb-2">01</div>
            <div className="font-bold mb-1">Upload Media</div>
            <div className="text-sm text-muted-foreground">Video or audio formats</div>
          </div>
          <ArrowRight className="text-muted-foreground hidden md:block" />
          <div className="flex-1 p-4">
            <div className="text-primary font-mono text-xl mb-2">02</div>
            <div className="font-bold mb-1">Processing</div>
            <div className="text-sm text-muted-foreground">AI transcription & translation</div>
          </div>
          <ArrowRight className="text-muted-foreground hidden md:block" />
          <div className="flex-1 p-4">
            <div className="text-primary font-mono text-xl mb-2">03</div>
            <div className="font-bold mb-1">Export SRT</div>
            <div className="text-sm text-muted-foreground">Download and deploy</div>
          </div>
        </div>
      </section>
    </div>
  );
}
