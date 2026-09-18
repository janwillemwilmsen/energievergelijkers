import Link from "next/link";
import { getPresets } from "@/lib/presets";
import { BOOKMARKLET_SITES, bookmarkName, buildBookmarklet, presetArgs } from "@/lib/bookmarklets";
import { usageLabel } from "@/lib/scenarioLabel";
import CopyUrlButton from "./CopyUrlButton";

// Presets and their addresses live in the database: render per request.
export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

// React refuses `javascript:` hrefs in JSX, which is exactly what a
// bookmarklet is; the links are therefore emitted as raw HTML.
function BookmarkLink({ href, name, title }: { href: string; name: string; title: string }) {
  const html = `<a class="inline-block max-w-full truncate rounded-md bg-emerald-700 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 cursor-grab" draggable="true" title="${esc(title)}" href="${esc(href)}">⚡ ${esc(name)}</a>`;
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

export default async function BookmarkletsPage() {
  const presets = await getPresets();
  const rows = [
    ...presets.map((p) => ({ key: `p${p.id}`, preset: p, args: presetArgs(p, p.address) })),
    { key: "ask", preset: null, args: null },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookmarklets</h1>
          <p className="text-sm text-slate-500">
            Eén bookmark per vergelijker en preset: sleep hem naar je bladwijzerbalk, ga naar de vergelijker en klik. De
            funnel wordt in dat tabblad doorlopen tot en met de resultatenpagina, met het verbruik én het adres van de
            preset (zie <Link href="/admin/presets" className="font-medium text-emerald-700 hover:underline">Presets</Link>).
          </p>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-emerald-700">
          <Link href="/" className="hover:underline">
            ← Dashboard
          </Link>
          <Link href="/admin/presets" className="hover:underline">
            Presets &amp; adres beheren →
          </Link>
        </nav>
      </header>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-2.5 text-left">Preset</th>
              {BOOKMARKLET_SITES.map((s) => (
                <th key={s.id} className="px-3 py-2.5 text-left">
                  {s.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3">
                  {row.preset ? (
                    <>
                      <div className="font-semibold text-slate-900">{row.preset.label}</div>
                      <div className="text-xs text-slate-600">{usageLabel(row.preset)}</div>
                      <div className="text-xs text-slate-500">
                        📍 {row.preset.address.postcode} {row.preset.address.huisnr}
                        {row.preset.postcode ? "" : " (standaardadres)"}
                      </div>
                      <code className="mt-1 block text-[10px] text-slate-400">{row.args}</code>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold text-slate-900">Zelf invullen</div>
                      <div className="text-xs text-slate-600">vraagt bij het klikken om adres en verbruik</div>
                    </>
                  )}
                </td>
                {BOOKMARKLET_SITES.map((site) => {
                  const href = buildBookmarklet(site.id, row.args);
                  const name = bookmarkName(site, row.preset);
                  return (
                    <td key={site.id} className="px-3 py-3">
                      <div className="flex flex-col items-start gap-1">
                        <BookmarkLink href={href} name={name} title={`${site.note}\n${row.args ?? "vraagt om invoer"}`} />
                        <CopyUrlButton url={href} />
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="space-y-2 text-sm text-slate-600">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Zo werkt het</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            De naam van de bookmark bevat het verbruik, zodat je in de bladwijzerbalk ziet welke preset erachter zit. Na
            een wijziging van een preset of het adres: sleep de bookmarks opnieuw, de waarden zitten in de URL.
          </li>
          <li>
            Klik de bookmark op een pagina van de vergelijker zelf. Klik je hem ergens anders, dan gaat het tabblad
            eerst naar de startpagina van de site en klik je daar nogmaals.
          </li>
          <li>
            Een statusbox rechtsonder toont de stappen; bij een fout staat daar de reden. Overstappen en Independer
            tonen de resultaten in een frame binnen het tabblad, de andere sites navigeren door naar de resultaten-URL.
          </li>
          <li>
            Liever een apart venster? Zet in de console <code>window.__rrMode = &quot;popup&quot;</code> voordat je
            klikt. De code staat in <code>dashboard/bookmarklets/</code>; de scrapers in de repo-root blijven de bron
            voor de selectors.
          </li>
        </ul>
      </section>
    </div>
  );
}
