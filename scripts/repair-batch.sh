#!/bin/bash
# Batch repair: runs repair-missing-data.ts section by section
# Order: smallest sections first to validate before committing to large ones
#
# Section 21: 52 missing   (~2 min)
# Section 19: 65 missing   (~2 min)
# Section 12: 183 missing  (~6 min)
# Section 14: 187 missing  (~6 min)
# Section 13: 371 missing  (~12 min)
# Section 20: 321 missing  (~11 min)
# Section 18: 518 missing  (~17 min)
# Section 17: 855 missing  (~28 min)
# Section 11: 1151 missing (~38 min)
# Section 15: 1417 missing (~47 min)
# Section 16: 2420 missing (~80 min)
#
# Total estimated: ~4.5 hours at 2s average delay

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/.."

SECTIONS=(21 19 12 14 13 20 18 17 11 15 16)
COOLDOWN=60

echo "=== Batch Repair: Sections 11-21 ==="
echo "Starting at: $(date)"
echo ""

for section in "${SECTIONS[@]}"; do
  echo "=========================================="
  echo "  Processing Section $section"
  echo "  Started at: $(date)"
  echo "=========================================="

  npx tsx scripts/repair-missing-data.ts --section="$section"

  echo ""
  echo "  Section $section completed at: $(date)"
  echo "  Cooling down for ${COOLDOWN}s..."
  echo ""
  sleep $COOLDOWN
done

echo "=========================================="
echo "  ALL SECTIONS COMPLETE"
echo "  Finished at: $(date)"
echo "=========================================="
