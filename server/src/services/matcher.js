/**
 * MADAD Explainable Deterministic Matching Engine
 * 
 * Free, deterministic, reliable, zero-paid-API algorithm.
 * Evaluates:
 * 1. Category alignment (40 pts)
 * 2. Keyword & problem context relevance (25 pts)
 * 3. Geographic proximity & service area compatibility (20 pts)
 * 4. Provider verification status (10 pts)
 * 5. Current confirmed availability (5 pts)
 */

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

export function matchProviders(request, providers) {
  if (!providers || providers.length === 0) {
    return [];
  }

  const reqCategory = (request.category || "").toLowerCase();
  const reqCity = (request.city || "").trim().toLowerCase();
  const reqState = (request.state || "").trim().toLowerCase();
  const reqPin = (request.pin_code || "").trim();
  const reqType = (request.assistance_type || "").toLowerCase();
  const reqTokens = new Set([
    ...tokenize(request.title),
    ...tokenize(request.description),
    ...tokenize(request.assistance_type)
  ]);

  const scored = providers.map(provider => {
    let score = 0;
    const rationale = [];
    const missingCriteria = [];

    // 1. Category Alignment (Max 40)
    const provCategories = (provider.categories || []).map(c => c.toLowerCase());
    if (provCategories.includes(reqCategory)) {
      score += 40;
      rationale.push(`Direct category match in ${formatCategory(reqCategory)}.`);
    } else {
      missingCriteria.push(`Provider does not explicitly list category ${formatCategory(reqCategory)}.`);
    }

    // 2. Keyword & Service Context Relevance (Max 25)
    const provContent = [
      provider.name,
      provider.description,
      ...(provider.assistance_types || [])
    ].join(" ");
    const provTokens = tokenize(provContent);
    let matchedKeywords = 0;
    const keyMatchedWords = [];

    for (const token of reqTokens) {
      if (provTokens.includes(token)) {
        matchedKeywords++;
        if (keyMatchedWords.length < 4) {
          keyMatchedWords.push(token);
        }
      }
    }

    if (matchedKeywords > 0) {
      const keywordScore = Math.min(25, matchedKeywords * 6);
      score += keywordScore;
      rationale.push(`Offers relevant support matching your request keywords: "${keyMatchedWords.join('", "')}".`);
    }

    // 3. Geographic Proximity & Service Area Coverage (Max 20)
    const provCity = (provider.city || "").trim().toLowerCase();
    const provState = (provider.state || "").trim().toLowerCase();
    const provPin = (provider.pin_code || "").trim();
    const provAreas = (provider.service_areas || []).map(a => a.toLowerCase());

    const inServiceArea = provAreas.some(area => 
      area.includes(reqCity) || reqCity.includes(area) || (request.title && request.title.toLowerCase().includes(area))
    );

    if (reqPin && provPin && reqPin === provPin) {
      score += 20;
      rationale.push(`Located directly in your PIN code (${provPin}).`);
    } else if (provCity && reqCity && (provCity === reqCity || inServiceArea)) {
      score += 16;
      rationale.push(`Operates locally within your city (${provider.city}) and active service area.`);
    } else if (provState && reqState && provState === reqState) {
      score += 10;
      rationale.push(`Based in your state (${provider.state}) with regional service capacity.`);
    } else {
      score += 4;
      missingCriteria.push(`Located outside your direct locality (${provider.city}, ${provider.state}); national or outstation coordination required.`);
    }

    // 4. Verification Status (Max 10)
    if (provider.verification_status === "verified") {
      score += 10;
      rationale.push("Formally verified organisation with audited registration.");
    } else if (provider.verification_status === "pending") {
      score += 3;
      missingCriteria.push("Verification audit is currently pending.");
    } else {
      missingCriteria.push("Community provider without completed verification.");
    }

    // 5. Availability Status (Max 5, Penalty if unavailable)
    if (provider.availability_status === "available") {
      score += 5;
      rationale.push("Currently active and accepting direct assistance requests.");
    } else if (provider.availability_status === "limited") {
      score += 2;
      missingCriteria.push("Operating under high volume with limited immediate capacity.");
    } else if (provider.availability_status === "unavailable") {
      score -= 25;
      missingCriteria.push("Currently reported unavailable for new intakes.");
    }

    // Final normalized score between 0 and 100
    const finalScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      provider,
      match_score: finalScore,
      relevance_level: finalScore >= 75 ? "High Relevance" : finalScore >= 50 ? "Moderate Relevance" : "Potential Alternative",
      rationale,
      missingCriteria
    };
  });

  // Sort descending by match_score
  scored.sort((a, b) => b.match_score - a.match_score);

  // Return best match and up to 2 alternatives
  return scored.slice(0, 3).map((match, index) => ({
    ...match,
    rank: index + 1,
    is_best_match: index === 0
  }));
}

function formatCategory(cat) {
  const map = {
    education: "Education",
    food_and_essentials: "Food & Essentials",
    medical_assistance: "Medical Assistance",
    shelter_and_support: "Shelter & Basic Support",
    community_support: "Community Support"
  };
  return map[cat] || cat;
}
