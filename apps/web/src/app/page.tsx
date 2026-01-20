import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-foreground">CSZ Webshop</h1>
      <p className="text-lg text-muted-foreground">
        Tuzvedelmi eszkozok es biztonsagi felszerelesek
      </p>
      <div className="flex gap-4">
        <Button>Termekek</Button>
        <Button variant="outline">Kategoriak</Button>
      </div>
    </main>
  );
}
