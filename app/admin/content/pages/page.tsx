import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageTable } from "@/components/admin/page-table"
import { Search, Filter, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

const pageStats = [
  { title: "Published Pages", value: "8", change: "+2%" },
  { title: "Draft Pages", value: "4", change: "+1%" },
  { title: "Total Views", value: "18.2K", change: "+15%" },
  { title: "Avg. Page Views", value: "1.5K", change: "+8%" },
]

export default function PagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
          <p className="text-muted-foreground">Manage your website pages and content</p>
        </div>
        <Button asChild>
          <Link href="/admin/content/pages/new">
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Link>
        </Button>
      </div>

      {/* Page Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pageStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search pages..." className="pl-10" />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <PageTable />
    </div>
  )
}
