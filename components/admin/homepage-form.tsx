"use client";

import { useActionState, useState, type FormEvent } from "react";
import {
  defaultHomepageContent,
  homepageContentSchema,
  homepageIssueMessage,
  type HomepageBrandStory,
  type HomepageContent,
  type HomepageDocumentResponse,
  type HomepageHero,
  type HomepageLookbook,
  type HomepageLookbookEdit,
  type HomepageMoment,
  type HomepageMomentRail,
  type HomepageNewsletter,
  type HomepageProductRail,
  type HomepageTile,
  type HomepageTrustItem,
} from "@abeera/shared";

import { RecordList, TextControl } from "@/components/admin/homepage-fields";
import { saveHomepageAction, type HomepageSaveState } from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const linkHint = "Path like /shop, or a full http(s) URL.";
const imageHint = "Paste a public image URL. Unsplash and Cloudinary are optimized; other https URLs still show.";

const idleState: HomepageSaveState = { status: "idle", message: "" };

const tileFields = [
  { key: "title" as const, label: "Title" },
  { key: "label" as const, label: "Kicker" },
  { key: "href" as const, label: "Link", hint: linkHint },
  { key: "imageUrl" as const, label: "Image URL", image: true, hint: imageHint },
  { key: "imageAlt" as const, label: "Image description" },
];

const momentFields = [
  { key: "title" as const, label: "Title" },
  { key: "copy" as const, label: "Copy", multiline: true },
  { key: "href" as const, label: "Link", hint: linkHint },
  { key: "imageUrl" as const, label: "Image URL", image: true, hint: imageHint },
  { key: "imageAlt" as const, label: "Image description" },
];

const trustFields = [
  { key: "title" as const, label: "Title" },
  { key: "copy" as const, label: "Detail" },
];

const editFields = [
  { key: "title" as const, label: "Title" },
  { key: "copy" as const, label: "Copy", multiline: true },
  { key: "href" as const, label: "Link", hint: linkHint },
  { key: "imageUrl" as const, label: "Image URL", image: true, hint: imageHint },
  { key: "imageAlt" as const, label: "Image description" },
];

function blankTile(): HomepageTile {
  return { ...defaultHomepageContent.collections[0], title: "New collection", href: "/shop" };
}

function blankMoment(): HomepageMoment {
  return {
    ...defaultHomepageContent.moments.moments[0],
    title: "New moment",
    copy: "A short line for this edit.",
    href: "/shop",
  };
}

function blankTrust(): HomepageTrustItem {
  return { title: "New promise", copy: "A short detail." };
}

function blankEdit(): HomepageLookbookEdit {
  return {
    ...defaultHomepageContent.lookbook.edits[0],
    title: "New edit",
    copy: "A short line for this edit.",
    href: "/shop",
  };
}

function formatWhen(iso: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function HomepageForm({ initial }: { initial: HomepageDocumentResponse }) {
  const [content, setContent] = useState<HomepageContent>(initial.content);
  const [clientError, setClientError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [state, formAction, pending] = useActionState(saveHomepageAction, idleState);
  const busy = pending || saving;

  function setHero<K extends keyof HomepageHero>(key: K, value: HomepageHero[K]) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
  }

  function setMoments<K extends keyof HomepageMomentRail>(key: K, value: HomepageMomentRail[K]) {
    setContent((current) => ({ ...current, moments: { ...current.moments, [key]: value } }));
  }

  function setRail<K extends keyof HomepageProductRail>(key: K, value: HomepageProductRail[K]) {
    setContent((current) => ({ ...current, productRail: { ...current.productRail, [key]: value } }));
  }

  function setStory<K extends keyof HomepageBrandStory>(key: K, value: HomepageBrandStory[K]) {
    setContent((current) => ({ ...current, brandStory: { ...current.brandStory, [key]: value } }));
  }

  function setNewsletter<K extends keyof HomepageNewsletter>(key: K, value: HomepageNewsletter[K]) {
    setContent((current) => ({ ...current, newsletter: { ...current.newsletter, [key]: value } }));
  }

  function setLookbook<K extends keyof HomepageLookbook>(key: K, value: HomepageLookbook[K]) {
    setContent((current) => ({ ...current, lookbook: { ...current.lookbook, [key]: value } }));
  }

  const savedAt = formatWhen(initial.updatedAt);
  const status = clientError
    ? { tone: "error" as const, message: clientError }
    : state.status === "error"
      ? { tone: "error" as const, message: state.message }
      : state.status === "saved"
        ? { tone: "success" as const, message: state.message }
        : notice
          ? { tone: "muted" as const, message: notice }
          : initial.source === "default"
            ? {
                tone: "muted" as const,
                message: savedAt
                  ? "The saved homepage could not be read, so the original Lahore House copy is shown. Save to replace it."
                  : "Nothing is saved yet. These fields match the current homepage. Save to store them.",
              }
            : { tone: "muted" as const, message: savedAt ? `Last saved ${savedAt}.` : null };

  function restoreDefaults() {
    setContent(structuredClone(defaultHomepageContent));
    setClientError(null);
    setNotice("Original Lahore House copy is in the form. Save to publish it.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = homepageContentSchema.safeParse(content);
    if (!parsed.success) {
      setClientError(homepageIssueMessage(parsed.error));
      return;
    }
    setClientError(null);
    setNotice(null);
    setContent(parsed.data);
    const formData = new FormData();
    formData.set("document", JSON.stringify(parsed.data));
    setSaving(true);
    try {
      await formAction(formData);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-6">
      <FormActions busy={busy} status={status} onRestore={restoreDefaults} />

      <Section
        title="Hero"
        description="The opening screen. The emphasized phrase sits in italic after the headline and wraps onto the next line when the lead is short."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="hero-eyebrow" label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => setHero("eyebrow", value)} />
          <TextControl id="hero-subline" label="Subline" value={content.hero.subline} onChange={(value) => setHero("subline", value)} />
          <TextControl id="hero-lead" label="Headline" value={content.hero.headlineLead} onChange={(value) => setHero("headlineLead", value)} />
          <TextControl
            id="hero-emphasis"
            label="Emphasized phrase"
            value={content.hero.headlineEmphasis}
            hint="Italic text after the headline. Leave blank to hide it."
            onChange={(value) => setHero("headlineEmphasis", value)}
          />
          <TextControl id="hero-body" label="Body" value={content.hero.body} multiline onChange={(value) => setHero("body", value)} />
          <TextControl
            id="hero-image"
            label="Background image URL"
            value={content.hero.imageUrl}
            image
            hint={imageHint}
            onChange={(value) => setHero("imageUrl", value)}
          />
          <TextControl id="hero-alt" label="Image description" value={content.hero.imageAlt} onChange={(value) => setHero("imageAlt", value)} />
          <TextControl id="hero-primary-label" label="Primary button" value={content.hero.primaryCta.label} onChange={(value) => setHero("primaryCta", { ...content.hero.primaryCta, label: value })} />
          <TextControl id="hero-primary-href" label="Primary link" value={content.hero.primaryCta.href} hint={linkHint} onChange={(value) => setHero("primaryCta", { ...content.hero.primaryCta, href: value })} />
          <TextControl id="hero-secondary-label" label="Secondary button" value={content.hero.secondaryCta.label} onChange={(value) => setHero("secondaryCta", { ...content.hero.secondaryCta, label: value })} />
          <TextControl id="hero-secondary-href" label="Secondary link" value={content.hero.secondaryCta.href} hint={linkHint} onChange={(value) => setHero("secondaryCta", { ...content.hero.secondaryCta, href: value })} />
        </div>
      </Section>

      <Section title="Featured collections" description="The three portrait tiles under the hero.">
        <RecordList
          items={content.collections}
          onChange={(collections) => setContent((current) => ({ ...current, collections }))}
          fields={tileFields}
          createItem={blankTile}
          itemName="Collection"
          idPrefix="collection"
          max={6}
        />
      </Section>

      <Section title="Moment rail" description="The horizontal row of edits, including the section heading and the view-all link.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="moments-kicker" label="Kicker" value={content.moments.kicker} onChange={(value) => setMoments("kicker", value)} />
          <TextControl id="moments-title" label="Title" value={content.moments.title} onChange={(value) => setMoments("title", value)} />
          <TextControl id="moments-lede" label="Lede" value={content.moments.lede} multiline onChange={(value) => setMoments("lede", value)} />
          <TextControl id="moments-view-label" label="View all label" value={content.moments.viewAllLabel} onChange={(value) => setMoments("viewAllLabel", value)} />
          <TextControl id="moments-view-href" label="View all link" value={content.moments.viewAllHref} hint={linkHint} onChange={(value) => setMoments("viewAllHref", value)} />
          <TextControl id="moments-card-cta" label="Card link label" value={content.moments.cardCtaLabel} onChange={(value) => setMoments("cardCtaLabel", value)} />
        </div>
        <RecordList
          items={content.moments.moments}
          onChange={(moments) => setMoments("moments", moments)}
          fields={momentFields}
          createItem={blankMoment}
          itemName="Moment"
          idPrefix="moment"
          max={8}
        />
      </Section>

      <Section
        title="Product rail"
        description="Heading above the catalog row. The products themselves stay in the product catalog: bestsellers first, then new arrivals."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="rail-eyebrow" label="Eyebrow" value={content.productRail.eyebrow} onChange={(value) => setRail("eyebrow", value)} />
          <TextControl id="rail-title" label="Title" value={content.productRail.title} onChange={(value) => setRail("title", value)} />
          <TextControl id="rail-lede" label="Lede" value={content.productRail.lede} multiline onChange={(value) => setRail("lede", value)} />
          <TextControl id="rail-label" label="View all label" value={content.productRail.viewAllLabel} onChange={(value) => setRail("viewAllLabel", value)} />
          <TextControl id="rail-href" label="View all link" value={content.productRail.href} hint={linkHint} onChange={(value) => setRail("href", value)} />
        </div>
      </Section>

      <Section title="Brand story" description="The split editorial block: photograph on one side, house copy on the other.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="story-kicker" label="Kicker" value={content.brandStory.kicker} onChange={(value) => setStory("kicker", value)} />
          <TextControl id="story-cta-label" label="Button" value={content.brandStory.ctaLabel} onChange={(value) => setStory("ctaLabel", value)} />
          <TextControl id="story-title" label="Title" value={content.brandStory.title} multiline onChange={(value) => setStory("title", value)} />
          <TextControl id="story-lede" label="Lede" value={content.brandStory.lede} multiline onChange={(value) => setStory("lede", value)} />
          <TextControl id="story-body" label="Body" value={content.brandStory.body} multiline onChange={(value) => setStory("body", value)} />
          <TextControl id="story-href" label="Button link" value={content.brandStory.ctaHref} hint={linkHint} onChange={(value) => setStory("ctaHref", value)} />
          <TextControl
            id="story-image"
            label="Image URL"
            value={content.brandStory.imageUrl}
            image
            hint={imageHint}
            onChange={(value) => setStory("imageUrl", value)}
          />
          <TextControl id="story-alt" label="Image description" value={content.brandStory.imageAlt} onChange={(value) => setStory("imageAlt", value)} />
        </div>
      </Section>

      <Section title="Trust strip" description="The short promises under the brand story. These are text only.">
        <RecordList
          items={content.trust}
          onChange={(trust) => setContent((current) => ({ ...current, trust }))}
          fields={trustFields}
          createItem={blankTrust}
          itemName="Promise"
          idPrefix="trust"
          max={8}
        />
      </Section>

      <Section title="Newsletter" description="The closing letters block, including the field label, button, and thank-you line.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="news-title" label="Title" value={content.newsletter.title} onChange={(value) => setNewsletter("title", value)} />
          <TextControl id="news-placeholder" label="Email placeholder" value={content.newsletter.placeholder} onChange={(value) => setNewsletter("placeholder", value)} />
          <TextControl id="news-lede" label="Lede" value={content.newsletter.lede} multiline onChange={(value) => setNewsletter("lede", value)} />
          <TextControl id="news-email" label="Email field label" value={content.newsletter.emailLabel} hint="Read by screen readers." onChange={(value) => setNewsletter("emailLabel", value)} />
          <TextControl id="news-submit" label="Button" value={content.newsletter.submitLabel} onChange={(value) => setNewsletter("submitLabel", value)} />
          <TextControl id="news-sending" label="Sending label" value={content.newsletter.sendingLabel} onChange={(value) => setNewsletter("sendingLabel", value)} />
          <TextControl id="news-success" label="Thank-you message" value={content.newsletter.successMessage} multiline onChange={(value) => setNewsletter("successMessage", value)} />
        </div>
      </Section>

      <Section
        title="Lookbook fallback"
        description="Shown on the homepage only when the product rail has no catalog pieces to display."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextControl id="look-kicker" label="Kicker" value={content.lookbook.kicker} onChange={(value) => setLookbook("kicker", value)} />
          <TextControl id="look-cta" label="Card link label" value={content.lookbook.cardCtaLabel} onChange={(value) => setLookbook("cardCtaLabel", value)} />
          <TextControl id="look-title" label="Title" value={content.lookbook.title} onChange={(value) => setLookbook("title", value)} />
          <TextControl id="look-lede" label="Lede" value={content.lookbook.lede} multiline onChange={(value) => setLookbook("lede", value)} />
        </div>
        <RecordList
          items={content.lookbook.edits}
          onChange={(edits) => setLookbook("edits", edits)}
          fields={editFields}
          createItem={blankEdit}
          itemName="Edit"
          idPrefix="edit"
          max={6}
        />
      </Section>

      <FormActions busy={busy} status={status} onRestore={restoreDefaults} />
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5 rounded-xl border border-border bg-[#faf7f2] p-6">
      <div>
        <h2 className="font-serif text-2xl font-normal">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FormActions({
  busy,
  status,
  onRestore,
}: {
  busy: boolean;
  status: { tone: "error" | "success" | "muted"; message: string | null };
  onRestore: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p
        aria-live="polite"
        className={cn(
          "max-w-xl text-sm",
          status.tone === "error" && "text-destructive",
          status.tone === "success" && "text-foreground",
          status.tone === "muted" && "text-muted-foreground",
        )}
      >
        {status.message}
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="outline" onClick={onRestore} disabled={busy}>
          Restore defaults
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving" : "Save homepage"}
        </Button>
      </div>
    </div>
  );
}
