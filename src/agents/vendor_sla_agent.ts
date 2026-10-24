/**
 * KairOS Vendor SLA, RFP & Contract Protection Agent
 * 
 * Generates legally robust vendor specifications, SLA terms, force majeure clauses,
 * weather contingency policies, and milestone-based checklists.
 */

import { EventConfig, BudgetOptimizationResult, VendorRFPRequirement, VendorChecklistItem } from '../core/types';

export function generateVendorRFPs(config: EventConfig, budget: BudgetOptimizationResult): VendorRFPRequirement[] {
  const rfps: VendorRFPRequirement[] = [];

  budget.categories.forEach(cat => {
    const minBudget = Math.round(cat.allocatedCost * 0.9);
    const maxBudget = Math.round(cat.allocatedCost * 1.05);

    let deliverables: string[] = [];
    let slaClauses: string[] = [];
    let tips: string[] = [];

    switch (cat.categoryKey) {
      case 'venue':
      case 'permits_venue':
        deliverables = [
          'Full exclusive venue access including setup and teardown windows',
          'Access to 200A dedicated electrical service panels and emergency backup generator',
          'Commercial load-in / load-out loading dock access with freight elevator certification',
          'Onsite facility manager present throughout entire event duration'
        ];
        slaClauses = [
          'Guaranteed turnover: Space to be professionally cleaned and empty 3 hours prior to guest arrival',
          'Sound curfew guarantee: Venue must confirm sound ordinance parameters and decibel limit in writing',
          'Indoor weather backup room reserved at zero additional surcharge for outdoor reservations'
        ];
        tips = [
          'Ask for complimentary rehearsal hours the day before',
          'Negotiate waiver of outside vendor fee if using unlisted caterers/AV'
        ];
        break;

      case 'catering':
      case 'food_refreshments':
        deliverables = [
          `Full culinary service for ${config.guestCount} guests adhering to dietary protocols`,
          'Certified commercial food handlers with HACCP cold-chain compliance',
          'Full bar service package including liquor liability insurance ($2M aggregate)',
          'Complete breakdown, trash bagging, and kitchen wipe-down by 23:30'
        ];
        slaClauses = [
          'Temperature safety SLA: Perishable food must not sit out exceeding 120 minutes without replenishment',
          'Staffing ratio guarantee: Minimum 1 server per 12 guests for plated service, or 1 per 25 for buffet',
          'Menu tasting for 4 guests included at least 60 days prior to event with full sign-off'
        ];
        tips = [
          'Request corkage fee cap if supplying your own wine',
          'Confirm that vendor meals for photographers and DJ are discounted by 50%'
        ];
        break;

      case 'photography':
        deliverables = [
          'Up to 8 hours of continuous coverage by Lead Photographer and Second Shooter',
          'Full high-resolution edited digital gallery delivered within 30 business days',
          'Unrestricted personal print and sharing rights with high-res cloud backup for 12 months',
          'Sneak peek gallery of 25 highlight photographs delivered within 48 hours of event'
        ];
        slaClauses = [
          'Illness replacement guarantee: Backup lead photographer of equal caliber provided if lead falls ill',
          'Dual memory card slot recording required throughout event to eliminate SD card corruption risk',
          'Shot list adherence SLA: Mandatory golden hour and family formal list checklist sign-off'
        ];
        tips = [
          'Bundle engagement session or portrait shoot into total package cost',
          'Ensure contract explicitly states who retains RAW file rights if desired'
        ];
        break;

      case 'entertainment':
      case 'staging_av':
        deliverables = [
          'Complete professional sound reinforcement system with wireless UHF handheld microphones',
          'Dynamic LED uplighting package with DMX controller and sound-reactive moving heads',
          'Master of Ceremonies (MC) duties including schedule announcements and timeline pacing',
          'Pre-approved customized playlist and explicit "Do Not Play" blacklist enforcement'
        ];
        slaClauses = [
          'Zero-dead-air guarantee: Continuous background audio feed during all transition intervals',
          'Early arrival SLA: Equipment setup and soundcheck completed 90 minutes before guest ingress',
          'Decibel monitor compliance: Sound levels must not exceed local municipal limits'
        ];
        tips = [
          'Request inclusion of ceremony lapel microphones at no extra charge',
          'Verify if overtime rate is billed by 30-minute increments instead of full hours'
        ];
        break;

      default:
        deliverables = [
          `Professional execution of ${cat.name} deliverables as scoped in design plan`,
          'Certificate of Commercial General Liability Insurance ($1,000,000 minimum)',
          'Clear itemized breakdown of materials, labor, and travel expenses'
        ];
        slaClauses = [
          'On-time delivery SLA: Delivery to site at least 2 hours before scheduled milestone start',
          'Defect cure period: Vendor must replace damaged or sub-par goods within 60 minutes'
        ];
        tips = [
          'Request early-payment discount (e.g. 3-5% off for full payment via ACH)',
          'Ensure deposit does not exceed 30% upon initial contract signing'
        ];
        break;
    }

    rfps.push({
      category: cat.name,
      recommendedBudgetMin: minBudget,
      recommendedBudgetMax: maxBudget,
      deliverables,
      requiredSlaClauses: slaClauses,
      forceMajeureClause: 'Neither party shall be held liable for failure of performance caused by Acts of God, government mandates, extreme severe weather alerts, or infrastructure outages, provided 48 hours written notice is rendered and deposit credits remain transferable for up to 18 months.',
      weatherContingencyRequirement: config.outdoorPortion 
        ? 'Vendor contract MUST mandate a secondary indoor execution protocol executable with 4 hours notice without price penalties.'
        : 'Standard indoor protocol applies.',
      negotiationScriptTips: tips
    });
  });

  return rfps;
}

export function generateVendorChecklist(_config: EventConfig): VendorChecklistItem[] {
  return [
    {
      id: 'chk-12m-01',
      category: 'Venue & Permitting',
      milestoneMonthsBefore: 12,
      task: 'Finalize venue contract, insurance requirements, and lock in load-in hours',
      slaCriteria: 'Ensure 3 hours minimum setup buffer before guest arrival',
      riskMitigation: 'Obtain written confirmation of indoor backup space for rain',
      isCompleted: true
    },
    {
      id: 'chk-12m-02',
      category: 'Catering & Culinary',
      milestoneMonthsBefore: 12,
      task: 'Reserve primary caterer and verify alcohol licensing and dietary safety capabilities',
      slaCriteria: 'Confirm compliance with HACCP food holding guidelines',
      riskMitigation: 'Confirm caterer provides sufficient certified service staff',
      isCompleted: false
    },
    {
      id: 'chk-06m-01',
      category: 'Photography & Media',
      milestoneMonthsBefore: 6,
      task: 'Execute contract with lead photographer and establish golden hour shooting window',
      slaCriteria: 'Mandate dual memory card recording and 30-day gallery delivery',
      riskMitigation: 'Designate emergency backup shooter clause in contract',
      isCompleted: false
    },
    {
      id: 'chk-06m-02',
      category: 'Entertainment & AV',
      milestoneMonthsBefore: 6,
      task: 'Book DJ / live musicians and lock sound reinforcement package',
      slaCriteria: 'Soundcheck completed 90 min before guest arrival',
      riskMitigation: 'Confirm backup generator or UPS battery power on site',
      isCompleted: false
    },
    {
      id: 'chk-03m-01',
      category: 'Decor & Florals',
      milestoneMonthsBefore: 3,
      task: 'Review sample centerpieces, floral mockups, and stage architectural layout',
      slaCriteria: 'Fresh floral installation to happen morning-of within 3-hour window',
      riskMitigation: 'Specify hardy seasonal blooms resistant to ambient wilting',
      isCompleted: false
    },
    {
      id: 'chk-01m-01',
      category: 'Timeline Coordination',
      milestoneMonthsBefore: 1,
      task: 'Distribute KairOS Critical Path Gantt schedule to all vendors and venue coordinator',
      slaCriteria: 'All vendors must acknowledge receipt and confirm arrival windows in writing',
      riskMitigation: 'Establish a designated vendor load-in schedule to avoid loading dock traffic jams',
      isCompleted: false
    },
    {
      id: 'chk-00d-01',
      category: 'Day-Of Operations',
      milestoneMonthsBefore: 0,
      task: 'Conduct morning vendor roll call, safety walk-through, and emergency contact verification',
      slaCriteria: 'All lead vendors on site and checked in at designated earliest start (ES)',
      riskMitigation: 'Keep print copies of vendor contracts and emergency mobile numbers on clipboard',
      isCompleted: false
    }
  ];
}
