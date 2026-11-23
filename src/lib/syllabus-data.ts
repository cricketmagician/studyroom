import { Level } from "./cma";

export interface SyllabusSection {
  title: string;
  weight: number; // percentage (e.g. 40)
  description: string;
  chapters: string[];
}

export interface SubjectSyllabus {
  id: string; // "5" to "12"
  code: string; // "BLE", "FA", "CA", etc.
  level: Level;
  group: "Group 1" | "Group 2";
  name: string;
  tagline: string;
  totalMarks: number;
  duration: string;
  examNature: "Objective & Descriptive" | "Case Analysis & Problem Solving" | "Computational & Conceptual";
  scoringDifficulty: "Easier to score" | "Medium" | "Hard";
  overview: string;
  examStrategy: string[];
  sections: SyllabusSection[];
}

export const SYLLABUS_DATA: SubjectSyllabus[] = [
  // ================= INTERMEDIATE GROUP 1 =================
  {
    id: "5",
    code: "BLE",
    level: "Intermediate",
    group: "Group 1",
    name: "Business Laws and Ethics",
    tagline: "Corporate governance, labor compliance, commercial agreements, and ethical dilemmas.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Objective & Descriptive",
    scoringDifficulty: "Medium",
    overview: "Equips intermediate students with deep legal acumen across Indian company law, partnership structures, industrial codes, and business ethics.",
    examStrategy: [
      "Companies Act 2013 (Section C, 40%) is the heaviest weighted: master Directors, Meetings, and CSR.",
      "Code on Wages 2019 and Factories Act require memory of statutory timelines and thresholds.",
      "Quote sections accurately in case-based questions for full credit."
    ],
    sections: [
      {
        title: "Section A: Commercial Laws",
        weight: 30,
        description: "Indian Contract Act, Sale of Goods, Partnership, and Limited Liability Partnership.",
        chapters: [
          "Indian Contract Act, 1872: Indemnity & Guarantee, Bailment & Pledge, Agency contracts",
          "Sale of Goods Act, 1930: Transfer of Ownership, Performance of Contract, Auction Sales",
          "Indian Partnership Act, 1932: Nature, Registration, Mutual Rights, Dissolution of Firm",
          "Limited Liability Partnership (LLP) Act, 2008: Nature, Formation, Partners, Winding Up"
        ]
      },
      {
        title: "Section B: Industrial Laws",
        weight: 15,
        description: "Workplace compliance, worker welfare, and modern labor codes.",
        chapters: [
          "The Code on Wages, 2019: Minimum Wages, Payment of Wages, Bonus Regulations",
          "The Factories Act, 1948: Health, Safety, Welfare, Working Hours of Adults",
          "Employees' Provident Funds and Miscellaneous Provisions Act, 1952",
          "Employees' State Insurance (ESI) Act, 1948 & Payment of Gratuity Act, 1972"
        ]
      },
      {
        title: "Section C: Corporate Laws",
        weight: 40,
        description: "Comprehensive statutory framework of the Companies Act, 2013.",
        chapters: [
          "Company Formation & Conversion: Types of Companies, MOA & AOA, Doctrine of Indoor Management",
          "Prospectus, Allotment of Securities, Share Capital, Debentures & Acceptance of Deposits",
          "Directors: Qualifications, Appointment, Disqualification, Powers, Board Meetings & Committees",
          "Key Managerial Personnel (KMP): Managing Director, Whole-time Director, Company Secretary",
          "Corporate Social Responsibility (CSR - Section 135) and Internal Controls"
        ]
      },
      {
        title: "Section D: Business Ethics",
        weight: 15,
        description: "Ethical reasoning, corporate integrity, emotional quotient, and stakeholder governance.",
        chapters: [
          "Ethics and Business: Ethical Principles, Value-based Organizations",
          "Ethical Dilemmas in Business: Whistleblowing, Conflict of Interest, Insider Trading",
          "Emotional Intelligence in Decision Making & Seven Principles of Public Life"
        ]
      }
    ]
  },
  {
    id: "6",
    code: "FA",
    level: "Intermediate",
    group: "Group 1",
    name: "Financial Accounting",
    tagline: "Accounting standards convergence, partnership reconstitution, and branch operations.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Medium",
    overview: "Rigorous training in preparing financial statements, special commercial accounts, and Indian Accounting Standards (Ind AS) principles.",
    examStrategy: [
      "Partnership accounts (Admission + Retirement + Dissolution / Insolvency piecemeal) appear every term.",
      "Branch accounting (Stock & Debtors method) and Hire Purchase are highly scoreable.",
      "Ind AS 2 (Inventories), Ind AS 16 (PPE), and Ind AS 115 (Revenue) need thorough practical coverage."
    ],
    sections: [
      {
        title: "Section A: Accounting Basics & Special Transactions",
        weight: 25,
        description: "Branch accounts, departmental statements, hire purchase, and royalty.",
        chapters: [
          "Branch Accounts: Dependent Branches, Debtors & Stock-and-Debtors Method, Independent Branches",
          "Departmental Accounts: Allocation of Incomes and Expenses, Inter-departmental Transfers",
          "Hire Purchase & Installment Sale Transactions: Default, Repossession & Interest Calculations",
          "Royalty Accounts: Minimum Rent, Shortworkings & Recoupment"
        ]
      },
      {
        title: "Section B: Special Business Activities",
        weight: 20,
        description: "Insurance claims for loss of stock and profit, and partnership reconstruction.",
        chapters: [
          "Insurance Claims for Loss of Stock and Loss of Profit (Consequential Loss Policy)",
          "Partnership Accounts: Admission, Retirement, Death, Goodwill Valuation (AS 26)",
          "Dissolution of Partnership Firms: Garner vs Murray rule, Piecemeal Distribution of Cash"
        ]
      },
      {
        title: "Section C: Financial Statements of NPOs",
        weight: 15,
        description: "Non-profit accounting, educational institutions, and healthcare entities.",
        chapters: [
          "Preparation of Receipts & Payments Account, Income & Expenditure Statement, and Balance Sheet",
          "Treatment of Specific Funds: Life Membership Fees, Endowments, Legacies & Subscriptions"
        ]
      },
      {
        title: "Section D: Accounting Standards (Ind AS Framework)",
        weight: 40,
        description: "Conceptual framework and core standards of the Ind AS / AS ecosystem.",
        chapters: [
          "Framework for Preparation and Presentation of Financial Statements",
          "Ind AS 1: Presentation of Financial Statements",
          "Ind AS 2: Valuation of Inventories",
          "Ind AS 7: Statement of Cash Flows (Direct vs Indirect Method)",
          "Ind AS 16: Property, Plant and Equipment (PPE)",
          "Ind AS 115: Revenue from Contracts with Customers"
        ]
      }
    ]
  },
  {
    id: "7",
    code: "DITX",
    level: "Intermediate",
    group: "Group 1",
    name: "Direct and Indirect Taxation",
    tagline: "Income tax calculation across 5 heads, GST compliance, and customs valuation.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Hard",
    overview: "Provides in-depth computational and analytical competence across the Income-tax Act, 1961 and Goods & Services Tax (GST) laws in India.",
    examStrategy: [
      "Heads of Income: Focus intensely on PGBP (admissible vs inadmissible deductions) and Capital Gains.",
      "Input Tax Credit (ITC under Section 16 & 17(5)) and Place of Supply rules in GST are critical.",
      "Memorize TDS rates under Sections 194C, 194J, 194I, 194Q along with recent Finance Act amendments."
    ],
    sections: [
      {
        title: "Section A: Direct Taxation (Income Tax Act, 1961)",
        weight: 50,
        description: "Residential status, 5 heads of income, clubbing, set-off, and total taxable income.",
        chapters: [
          "Basic Concepts, Basis of Charge, Residential Status and Scope of Total Income",
          "Incomes which do not form part of Total Income (Exemptions under Section 10)",
          "Heads of Income: Salaries, Income from House Property",
          "Profits and Gains of Business or Profession (PGBP) & Presumptive Taxation (44AD/44ADA)",
          "Capital Gains: Short-term vs Long-term, Exemptions under Sections 54, 54EC, 54F",
          "Income from Other Sources: Dividends, Gifts, Deemed Incomes",
          "Clubbing of Income, Set-off and Carry Forward of Losses",
          "Deductions from Gross Total Income (Chapter VI-A: 80C to 80U)",
          "Assessment of Individuals, TDS/TCS Mechanics, Advance Tax & Filing of ITR"
        ]
      },
      {
        title: "Section B: Indirect Taxation (GST & Customs)",
        weight: 50,
        description: "CGST, SGST, IGST mechanisms, input credit chain, and customs valuation rules.",
        chapters: [
          "Concept of Indirect Taxes, Constitutional Provisions & GST Council",
          "Levy and Collection of CGST/IGST: Supply (Section 7), Composite & Mixed Supply",
          "Composition Scheme, Reverse Charge Mechanism (RCM)",
          "Time and Value of Supply under GST Rules",
          "Input Tax Credit (ITC): Eligibility, Conditions, Apportionment & Blocked Credits (Section 17(5))",
          "Registration, Tax Invoice, Credit & Debit Notes, E-Way Bill System, GST Returns",
          "Customs Act, 1962: Basic Concepts, Types of Customs Duties, Valuation of Imported Goods"
        ]
      }
    ]
  },
  {
    id: "8",
    code: "CA",
    level: "Intermediate",
    group: "Group 1",
    name: "Cost Accounting",
    tagline: "Core pillar of the CMA profession: costing methods, overhead absorption, and marginal decision tools.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Easier to score",
    overview: "The signature domain of Cost and Management Accountants. Master cost ascertainment, overhead apportionment, process costing, and break-even analysis.",
    examStrategy: [
      "Overheads primary and secondary distribution (step-ladder, simultaneous equations) carries guaranteed marks.",
      "Process costing: Equivalent units of production (FIFO and Weighted Average) must be rehearsed.",
      "Marginal costing: CVP formulas (P/V ratio, Margin of Safety, Key Factor decisions) are the highest scoring part."
    ],
    sections: [
      {
        title: "Section A: Introduction & Elements of Cost",
        weight: 40,
        description: "Material control, labor incentives, overhead allocation, absorption, and ABC.",
        chapters: [
          "Introduction to Cost Accounting: Cost Centers, Cost Units, Installation of Costing System",
          "Material Cost: EOQ, Stock Levels, Pricing of Issues (FIFO, LIFO, Weighted Average), ABC Analysis",
          "Employee Cost: Idle Time, Overtime, Incentive Schemes (Halsey, Rowan, Taylor, Merrick)",
          "Overheads: Classification, Primary & Secondary Apportionment, Absorption Methods, Under/Over Absorption",
          "Activity Based Costing (ABC): Cost Drivers, Cost Pools, Traditional vs ABC Costing",
          "Cost Accounting Standards (CAS): CAS 1 to CAS 24 Overview"
        ]
      },
      {
        title: "Section B: Cost Accounting Methods",
        weight: 30,
        description: "Job, batch, contract, operating, and process costing systems.",
        chapters: [
          "Job Costing and Batch Costing: Economic Batch Quantity (EBQ)",
          "Contract Costing: Retention Money, Escalation Clause, Work-in-Progress & Profit on Incomplete Contracts",
          "Process Costing: Normal Loss, Abnormal Loss, Abnormal Gain, Inter-process Profits, Equivalent Production",
          "Operating Costing: Transport, Hotel, Hospital & Power Generation Cost Ascertainment"
        ]
      },
      {
        title: "Section C: Cost Accounting Techniques",
        weight: 30,
        description: "Marginal costing, CVP analysis, standard costing variances, and budgetary control.",
        chapters: [
          "Marginal Costing: Concept, Absorption vs Marginal Costing, Cost-Volume-Profit (CVP) Analysis",
          "Break-even Point (BEP), P/V Ratio, Margin of Safety, Key Factor (Limiting Factor) Decisions",
          "Standard Costing: Material Cost Variances, Labor Cost Variances, Overhead Variances",
          "Budgetary Control: Types of Budgets, Flexible Budget, Cash Budget, Zero-Based Budgeting (ZBB)"
        ]
      }
    ]
  },

  // ================= INTERMEDIATE GROUP 2 =================
  {
    id: "9",
    code: "OMSM",
    level: "Intermediate",
    group: "Group 2",
    name: "Operations Management and Strategic Management",
    tagline: "Shop-floor production planning, PERT/CPM networks, and corporate strategic direction.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Easier to score",
    overview: "Combines industrial engineering tools like project scheduling and linear programming with macro corporate strategy, SWOT, and competitive positioning.",
    examStrategy: [
      "PERT/CPM critical path calculation, float determination, and crashing of networks are mandatory practical areas.",
      "Facility location techniques and Transportation / Assignment problems carry direct numerical marks.",
      "Strategic Management (40%) requires clear diagrams for BCG Matrix, Porter's Five Forces, and Ansoff's Matrix."
    ],
    sections: [
      {
        title: "Section A: Operations Management",
        weight: 60,
        description: "Production planning, facility design, project scheduling (PERT/CPM), and maintenance.",
        chapters: [
          "Operations Management: Scope, Historical Development, Manufacturing vs Service Systems",
          "Operations Planning: Demand Forecasting, Capacity Planning, Facility Location and Layout Design",
          "Production Planning and Control: Routing, Loading, Scheduling, Dispatching & Follow-up",
          "Project Management: Network Construction, Critical Path Method (CPM), PERT Analysis, Crashing",
          "Economics of Maintenance and Spares Management, Total Productive Maintenance (TPM)",
          "Linear Programming Formulation, Transportation Problems & Assignment Models"
        ]
      },
      {
        title: "Section B: Strategic Management",
        weight: 40,
        description: "Vision, mission, environmental scanning, competitive dynamics, and digital strategy.",
        chapters: [
          "Strategic Management Introduction: Hierarchy of Strategy (Corporate, Business, Functional)",
          "Strategic Analysis: SWOT Analysis, PESTLE Framework, Porter's Five Forces Model, Value Chain",
          "Strategic Formulation: Porter's Generic Strategies, BCG Matrix, Ansoff Growth Matrix",
          "Strategy Implementation and Evaluation: Balanced Scorecard, Digital & Platform Strategy"
        ]
      }
    ]
  },
  {
    id: "10",
    code: "CAA",
    level: "Intermediate",
    group: "Group 2",
    name: "Corporate Accounting and Auditing",
    tagline: "Company final accounts, banking & insurance reporting, internal control, and statutory audit.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Medium",
    overview: "Examines corporate financial reporting compliant with Schedule III of the Companies Act 2013, specialized industry accounts, and rigorous audit standards.",
    examStrategy: [
      "Company balance sheet format under Schedule III (Part I & II) must be memorized thoroughly.",
      "Auditor appointment, disqualification, rights, and CARO 2020 clauses are recurring theory topics.",
      "Banking company rebate on bills discounted and non-performing asset (NPA) provisions are frequent exam sums."
    ],
    sections: [
      {
        title: "Section A: Corporate Accounting",
        weight: 50,
        description: "Schedule III presentation, issue/buyback of shares, debentures, and banking/electricity accounts.",
        chapters: [
          "Accounting for Share Capital: Issue, Forfeiture, Re-issue, Buyback & Redemption of Preference Shares",
          "Accounting for Debentures: Issue, Redemption (Out of Profits, Capital, Sinking Fund)",
          "Presentation of Financial Statements under Schedule III of the Companies Act, 2013",
          "Cash Flow Statement as per Ind AS 7",
          "Accounts of Banking Companies: Statutory Reserves, NPA Classification, Rebate on Bills Discounted",
          "Accounts of Insurance Companies & Electricity Companies"
        ]
      },
      {
        title: "Section B: Auditing",
        weight: 50,
        description: "Audit planning, internal controls, company audit under Companies Act 2013, and CARO 2020.",
        chapters: [
          "Auditing Concepts: Nature, Scope, Independence, Materiality, Professional Skepticism",
          "Audit Planning, Audit Programme, Audit Documentation & Audit Evidence (SA 500 series)",
          "Internal Control, Internal Check & Internal Audit",
          "Audit of Limited Companies: Appointment, Eligibility, Removal, Rights, Duties, Audit Report (SA 700)",
          "Companies (Auditor's Report) Order, 2020 (CARO 2020)",
          "Cost Audit and Secretarial Audit statutory provisions"
        ]
      }
    ]
  },
  {
    id: "11",
    code: "FMDA",
    level: "Intermediate",
    group: "Group 2",
    name: "Financial Management and Business Data Analytics",
    tagline: "Corporate treasury, discounted cash flow capital budgeting, capital structure, and data insights.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Easier to score",
    overview: "Blends classical corporate financial decisions (investing, financing, dividend) with modern business data analytics tools for commercial problem solving.",
    examStrategy: [
      "Capital Budgeting techniques: NPV, IRR, Modified IRR, and Profitability Index are guaranteed 20+ marks.",
      "Working capital estimation (Operating cycle approach) and Cash management models (Baumol, Miller-Orr).",
      "Data analytics section: Understand basic classification, regression, and visualization tool roles."
    ],
    sections: [
      {
        title: "Section A: Financial Management",
        weight: 80,
        description: "Working capital, capital budgeting (NPV/IRR), cost of capital, leverages, and dividends.",
        chapters: [
          "Introduction to Financial Management: Scope, Objectives (Profit vs Wealth Maximization)",
          "Time Value of Money: Compounding, Discounting, Annuities, Amortization Schedules",
          "Cost of Capital: Cost of Debt, Preference, Equity (CAPM, Dividend Growth), WACC",
          "Capital Structure Theories: Net Income, Net Operating Income, Traditional, Modigliani-Miller (MM)",
          "Leverage Analysis: Operating Leverage, Financial Leverage, Combined Leverage, EBIT-EPS Analysis",
          "Capital Budgeting: Payback, ARR, Discounted Payback, NPV, IRR, MIRR, PI, Capital Rationing",
          "Working Capital Management: Operating Cycle, Inventory, Debtors, Cash Management Models",
          "Dividend Decisions: Walter's Model, Gordon's Model, Modigliani-Miller Dividend Irrelevance"
        ]
      },
      {
        title: "Section B: Business Data Analytics",
        weight: 20,
        description: "Data architectures, descriptive & predictive analytics, and visualization dashboards.",
        chapters: [
          "Introduction to Data Science & Big Data in Business Context",
          "Data Analysis Tools and Techniques: Descriptive, Diagnostic, Predictive & Prescriptive Analytics",
          "Data Visualization & Storytelling for Management Decisions (Tableau, PowerBI concepts)"
        ]
      }
    ]
  },
  {
    id: "12",
    code: "MA",
    level: "Intermediate",
    group: "Group 2",
    name: "Management Accounting",
    tagline: "Internal operational control, transfer pricing, standard variance reconciliation, and EVA.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Medium",
    overview: "Equips students to supply critical managerial information for pricing, divisional performance evaluation, transfer pricing between units, and activity control.",
    examStrategy: [
      "Transfer pricing methods (market price, cost-plus, negotiated) with internal divisional capacity limits.",
      "Advanced variance analysis (sales variances, planning & operational variances) carry high marks.",
      "Balanced Scorecard 4 perspectives and Economic Value Added (EVA) calculation must be thoroughly practiced."
    ],
    sections: [
      {
        title: "Section A: Introduction to Management Accounting",
        weight: 10,
        description: "Role of Management Accountant in enterprise decision making and strategic planning.",
        chapters: [
          "Concept, Role, Scope, and Comparison with Financial & Cost Accounting",
          "Management Reporting Systems and Ethical Guidelines for Management Accountants"
        ]
      },
      {
        title: "Section B: Activity Based Costing & Decision Making",
        weight: 35,
        description: "Strategic cost management, activity based budgeting, and internal transfer pricing.",
        chapters: [
          "Activity Based Costing (ABC) and Activity Based Management (ABM)",
          "Target Costing, Life Cycle Costing & Value Analysis",
          "Transfer Pricing: Cost Based, Market Based, Negotiated & Dual Rate Transfer Pricing"
        ]
      },
      {
        title: "Section C: Standard Costing & Variances",
        weight: 30,
        description: "Comprehensive variance analysis including sales value/margin and operational variances.",
        chapters: [
          "Standard Costing Implementation, Setting of Standards",
          "Direct Material and Direct Labor Variances with Mix & Yield Sub-variances",
          "Overhead Variances: Variable and Fixed Overhead Capacity & Efficiency Variances",
          "Sales Margin Variances and Reconciliation of Budgeted Profit with Actual Profit"
        ]
      },
      {
        title: "Section D: Performance Measurement",
        weight: 25,
        description: "Responsibility accounting, divisional ROI, EVA, and the Balanced Scorecard.",
        chapters: [
          "Responsibility Accounting: Cost, Revenue, Profit & Investment Centers",
          "Divisional Performance Measurement: Return on Investment (ROI) vs Residual Income (RI)",
          "Economic Value Added (EVA), Market Value Added (MVA)",
          "Balanced Scorecard (Kaplan & Norton): Financial, Customer, Internal Process, Learning & Growth"
        ]
      }
    ]
  }
];

export function getSyllabusByLevel(level: Level): SubjectSyllabus[] {
  return SYLLABUS_DATA.filter((s) => s.level === level);
}

export function getSubjectSyllabus(paperId: string): SubjectSyllabus | undefined {
  return SYLLABUS_DATA.find((s) => s.id === paperId);
}
