/**
 * Intelligent Priority Classification Service (Bonus Implementation)
 * Evaluates community report text and categorizes triage priority
 */

class ClassifierService {
  classifyPriority(content) {
    if (!content || typeof content !== 'string') {
      return 'medium';
    }

    const text = content.toLowerCase();

    // Critical: Immediate life safety threats, trapped individuals, gas leaks, structural collapse
    const criticalPatterns = [
      /trapped/,
      /urgent rescue/,
      /cannot breathe/,
      /heart attack/,
      /bleeding/,
      /gas leak/,
      /sparking violently/,
      /structural collapse/,
      /building collapsed/,
      /rising water.*trapped/,
      /fire spreading/
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(text)) {
        return 'critical';
      }
    }

    // High: Urgent resource deprivation (drinking water, baby food, hypothermia, elder care)
    const highPatterns = [
      /drinking water/,
      /clean water/,
      /baby formula/,
      /infant/,
      /elderly/,
      /wheelchair/,
      /insulin/,
      /dialysis/,
      /power outage/,
      /no electricity/
    ];

    for (const pattern of highPatterns) {
      if (pattern.test(text)) {
        return 'high';
      }
    }

    // Medium: Blocked routes, infrastructure damage, detours
    const mediumPatterns = [
      /blocked/,
      /debris/,
      /impassable/,
      /subway closed/,
      /flooded street/,
      /downed tree/,
      /traffic/
    ];

    for (const pattern of mediumPatterns) {
      if (pattern.test(text)) {
        return 'medium';
      }
    }

    // Low: Informational updates, opened shelters, aid distributions
    return 'low';
  }
}

module.exports = new ClassifierService();
