/**
 * Helpers for generating dynamic phone descriptions and FAQ content
 * from spec data, rather than relying solely on raw MD content.
 */

import type { SpecEntry } from "./types";

/** Pick the first spec value matching any keyword (case-insensitive). */
function pick(specs: SpecEntry[], keywords: string[]): string {
  return (
    specs.find((s) => keywords.some((kw) => s.label.toLowerCase().includes(kw)))
      ?.value ?? ""
  );
}

/**
 * Generate a fresh, human-readable description for a phone from its specs.
 * Mixes in spec data so every phone gets unique content.
 */
export function generatePhoneDescription(
  name: string,
  brand: string,
  price: string,
  released: string,
  specs: SpecEntry[],
): string {
  const display  = pick(specs, ["display", "screen"]);
  const battery  = pick(specs, ["battery"]);
  const camera   = pick(specs, ["main camera", "rear camera"]);
  const ram      = pick(specs, ["ram"]);
  const storage  = pick(specs, ["storage", "rom"]);
  const proc     = pick(specs, ["processor", "chipset", "cpu"]);
  const os       = pick(specs, ["os", "android", "software"]);
  const sim      = pick(specs, ["sim"]);

  const parts: string[] = [];

  parts.push(
    `The ${name} is a ${brand} smartphone released in ${released}, priced at ${price} in Bangladesh.`,
  );

  if (display) {
    parts.push(`It features a ${display} display that delivers vivid visuals and smooth interaction.`);
  }

  if (proc) {
    parts.push(`Under the hood, it is powered by the ${proc}${ram ? `, paired with ${ram} of RAM` : ""} for responsive multitasking.`);
  } else if (ram) {
    parts.push(`It comes with ${ram} of RAM for smooth multitasking.`);
  }

  if (storage) {
    parts.push(`Storage-wise, it offers ${storage} to hold your apps, photos, and media.`);
  }

  if (camera) {
    parts.push(`The camera system includes a ${camera} setup, allowing you to capture detailed photos and videos.`);
  }

  if (battery) {
    parts.push(`A ${battery} battery keeps the phone running throughout the day.`);
  }

  if (os) {
    parts.push(`It runs ${os} out of the box.`);
  }

  if (sim) {
    parts.push(`Connectivity options include ${sim} support.`);
  }

  return parts.join(" ");
}

/** A single FAQ item. */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generate FAQ items for a phone based on its specs and price data.
 * These are used for FAQ JSON-LD rich results in Google.
 */
export function generatePhoneFAQ(
  name: string,
  brand: string,
  price: string,
  released: string,
  specs: SpecEntry[],
): FAQItem[] {
  const faqs: FAQItem[] = [];

  // Price FAQ
  faqs.push({
    question: `What is the price of ${name} in Bangladesh?`,
    answer: `The ${name} is priced at ${price} in Bangladesh (${released}).`,
  });

  // RAM FAQ
  const ram = pick(specs, ["ram"]);
  if (ram) {
    faqs.push({
      question: `How much RAM does the ${name} have?`,
      answer: `The ${name} comes with ${ram} of RAM.`,
    });
  }

  // Battery FAQ
  const battery = pick(specs, ["battery"]);
  if (battery) {
    faqs.push({
      question: `What is the battery capacity of ${name}?`,
      answer: `The ${name} has a ${battery} battery.`,
    });
  }

  // Camera FAQ
  const camera = pick(specs, ["main camera", "rear camera"]);
  if (camera) {
    faqs.push({
      question: `What camera does the ${name} have?`,
      answer: `The ${name} features a ${camera} camera system.`,
    });
  }

  // Display FAQ
  const display = pick(specs, ["display", "screen"]);
  if (display) {
    faqs.push({
      question: `What is the display size of ${name}?`,
      answer: `The ${name} has a ${display} display.`,
    });
  }

  // Processor FAQ
  const proc = pick(specs, ["processor", "chipset", "cpu"]);
  if (proc) {
    faqs.push({
      question: `What processor does the ${name} use?`,
      answer: `The ${name} is powered by the ${proc}.`,
    });
  }

  // Storage FAQ
  const storage = pick(specs, ["storage", "rom"]);
  if (storage) {
    faqs.push({
      question: `How much storage does the ${name} have?`,
      answer: `The ${name} offers ${storage} of internal storage.`,
    });
  }

  return faqs;
}

/**
 * Build JSON-LD BreadcrumbList schema.
 */
export function buildBreadcrumbJsonLd(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Build JSON-LD FAQPage schema from FAQ items.
 */
export function buildFAQJsonLd(faqs: FAQItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
