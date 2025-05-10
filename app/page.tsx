import { MarriageCertificateGenerator } from "@/components/marriage-certificate-generator"
import { PageTransition } from "@/components/page-transition"
import { FloatingHearts } from "@/components/floating-hearts"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4 sm:px-6 lg:px-8 animated-gradient">
      <FloatingHearts />
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <MarriageCertificateGenerator />
        </div>
      </PageTransition>
    </main>
  )
}
