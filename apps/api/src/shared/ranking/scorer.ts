export function computeBusinessScore(b: any, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const name = (b.businessName || "").toLowerCase();
  const descText = (b.description || "").toLowerCase();
  const catName = (b.category?.name || "").toLowerCase();

  let score = 0;

  if (name === q) {
    score += 100;
  } else if (name.startsWith(q)) {
    score += 80;
  } else if (name.includes(q)) {
    score += 60;
  }

  if (catName === q || catName.includes(q)) {
    score += 40;
  }

  if (descText.includes(q)) {
    score += 20;
  }

  // Check services/products
  if (b.services?.some((s: any) => (s.name || "").toLowerCase().includes(q))) {
    score += 10;
  }
  if (b.products?.some((p: any) => (p.name || "").toLowerCase().includes(q))) {
    score += 10;
  }

  return score;
}

export function computeProviderScore(p: any, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  const prof = (p.profession || "").toLowerCase();
  const name = (p.fullName || "").toLowerCase();
  const bio = (p.bio || "").toLowerCase();
  const catName = (p.category?.name || "").toLowerCase();

  let score = 0;

  if (prof === q) {
    score += 100;
  } else if (prof.startsWith(q)) {
    score += 80;
  } else if (prof.includes(q)) {
    score += 60;
  }

  if (name === q) {
    score += 50;
  } else if (name.includes(q)) {
    score += 40;
  }

  if (p.skills?.some((s: any) => (s.skillName || "").toLowerCase().includes(q))) {
    score += 30;
  }

  if (catName === q || catName.includes(q)) {
    score += 20;
  }

  if (bio.includes(q)) {
    score += 10;
  }

  return score;
}
