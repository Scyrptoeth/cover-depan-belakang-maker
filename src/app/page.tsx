import { CoverMakerWorkbench } from "@/components/cover-maker-workbench";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="page-shell">
      <CoverMakerWorkbench />
      <SiteFooter />
    </main>
  );
}
