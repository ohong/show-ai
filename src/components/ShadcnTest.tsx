import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ShadcnTest() {
  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold">shadcn/ui Test Components</h2>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Buttons</h3>
        <div className="flex gap-4 flex-wrap">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Form Elements</h3>
        <div className="space-y-2">
          <Label htmlFor="test-input">Test Input</Label>
          <Input id="test-input" placeholder="Enter something..." />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cards</h3>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Test Card</CardTitle>
            <CardDescription>
              This is a test card to verify shadcn/ui is working correctly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All shadcn/ui components are properly configured and ready to use!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
