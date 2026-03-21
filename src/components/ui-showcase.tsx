"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { LogoutButton } from "@/components/logout-button"

export function UiShowcase() {
  const [intensity, setIntensity] = React.useState([40])

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 p-8">
      <Card>
        <CardHeader>
          <CardTitle>shadcn/ui</CardTitle>
          <CardDescription>
            Base components wired for this app — Button, Input, Textarea, Card,
            Dialog, Slider.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button">Button</Button>
            <Button type="button" variant="outline">
              Outline
            </Button>
            <LogoutButton />
            <Dialog>
              <DialogTrigger render={<Button variant="secondary" type="button" />}>
                Open dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Dialog</DialogTitle>
                  <DialogDescription>
                    Dialog content uses the same theme tokens as the rest of the
                    UI.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter showCloseButton />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="demo-input">
              Input
            </label>
            <Input id="demo-input" placeholder="Type something…" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="demo-textarea">
              Textarea
            </label>
            <Textarea id="demo-textarea" placeholder="Longer text…" rows={3} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">Slider</span>
              <span className="text-muted-foreground text-sm tabular-nums">
                {intensity[0]}
              </span>
            </div>
            <Slider
              value={intensity}
              onValueChange={(value) => {
                setIntensity(
                  Array.isArray(value) ? [...value] : [value]
                )
              }}
              max={100}
              step={1}
              aria-label="Intensity"
            />
          </div>
        </CardContent>
        <CardFooter className="text-muted-foreground text-xs">
          Global styles live in <code className="font-mono">src/app/globals.css</code>.
        </CardFooter>
      </Card>
    </div>
  )
}
