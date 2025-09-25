import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-background/40 z-10" />
      <img
        src="/elegant-fashion-model-in-minimalist-setting.jpg"
        alt="Hero fashion image"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 text-center max-w-2xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-balance mb-6">
          Discover Your
          <span className="block font-normal">Perfect Style</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty">
          Curated collections of premium fashion and lifestyle products that define modern elegance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/category/women">
              Shop Women
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/category/men">Shop Men</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
