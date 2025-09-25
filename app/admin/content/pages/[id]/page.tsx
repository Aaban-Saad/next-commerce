import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Save, Eye, Globe, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface PageEditorProps {
  params: {
    id: string
  }
}

const pageData = {
  id: "1",
  title: "Home Page",
  slug: "/",
  status: "Published",
  content: `
    <h1>Welcome to Our Store</h1>
    <p>Discover our latest collection of premium fashion items.</p>
    <div class="hero-section">
      <img src="/hero-banner.jpg" alt="Hero Banner" />
      <div class="hero-content">
        <h2>New Spring Collection</h2>
        <p>Explore our carefully curated selection of spring essentials.</p>
        <a href="/products" class="cta-button">Shop Now</a>
      </div>
    </div>
  `,
  metaTitle: "Premium Fashion Store - Latest Trends & Styles",
  metaDescription:
    "Discover premium fashion items and latest trends at our online store. Shop now for exclusive collections.",
  lastModified: "2024-01-15",
  author: "Admin",
  views: 12450,
}

export default function PageEditor({ params }: PageEditorProps) {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/content/pages">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pages
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Page</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={pageData.status === "Published" ? "default" : "secondary"}>{pageData.status}</Badge>
              <span className="text-sm text-muted-foreground">Last modified: {pageData.lastModified}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button variant="outline">
            <Globe className="mr-2 h-4 w-4" />
            View Live
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input id="title" defaultValue={pageData.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input id="slug" defaultValue={pageData.slug} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  defaultValue={pageData.content}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Enter your page content here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO Settings */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input id="metaTitle" defaultValue={pageData.metaTitle} />
                <p className="text-sm text-muted-foreground">Recommended: 50-60 characters</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea id="metaDescription" defaultValue={pageData.metaDescription} className="min-h-[100px]" />
                <p className="text-sm text-muted-foreground">Recommended: 150-160 characters</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Page Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Page Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={pageData.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Author</Label>
                <p className="text-sm text-muted-foreground">{pageData.author}</p>
              </div>
              <div className="space-y-2">
                <Label>Created</Label>
                <p className="text-sm text-muted-foreground">{pageData.lastModified}</p>
              </div>
            </CardContent>
          </Card>

          {/* Page Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Page Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{pageData.views.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>This Month</span>
                  <span className="font-medium">2,340</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Last Month</span>
                  <span className="font-medium">1,890</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Growth</span>
                  <span className="font-medium text-green-500">+23.8%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
