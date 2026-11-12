import { Level } from "./cma";

export interface SyllabusSection {
  title: string;
  weight: number; // percentage (e.g. 40)
  description: string;
  chapters: string[];
}

export interface SubjectSyllabus {
  id: string; // "1", "2", ..., "20C"
  code: string; // "FBLC", "CA", "SFM", etc.
  level: Level;
  group: "Foundation" | "Group 1" | "Group 2" | "Group 3" | "Group 4";
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
  // ================= FOUNDATION =================
  {
    id: "1",
    code: "FBLC",
    level: "Foundation",
    group: "Foundation",
    name: "Fundamentals of Business Laws and Business Communication",
    tagline: "Essential legal framework of commercial transactions and modern corporate communication.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Objective & Descriptive",
    scoringDifficulty: "Easier to score",
    overview: "Covers the fundamental principles of commercial legal systems in India including contracts, sales, and negotiable instruments, along with professional workplace communication skills.",
    examStrategy: [
      "Focus thoroughly on Indian Contract Act conditions, warranties, and remedies for breach.",
      "Practice letter drafting, circulars, and formal email etiquette for the communication section.",
      "Clear direct definitions and landmark case studies carry quick marks."
    ],
    sections: [
      {
        title: "Section A: Commercial Laws",
        weight: 60,
        description: "Core legal structures regulating everyday commerce, agreements, and payment instruments in India.",
        chapters: [
          "Indian Contract Act, 1872: Essential elements, Offer & Acceptance, Consideration, Capacity of Parties",
          "Free Consent, Legality of Object, Void Agreements, Contingent Contracts & Quasi Contracts",
          "Performance of Contracts, Discharge of Contract & Remedies for Breach",
          "Sale of Goods Act, 1930: Formation, Conditions & Warranties, Transfer of Property, Unpaid Seller Rights",
          "Negotiable Instruments Act, 1881: Promissory Notes, Bills of Exchange, Cheques, Dishonour of Cheques"
        ]
      },
      {
        title: "Section B: Business Communication",
        weight: 40,
        description: "Professional spoken, written, and digital business correspondence in corporate environments.",
        chapters: [
          "Introduction to Business Communication: Process, Types, Channels & Barriers",
          "Written Business Communication: Business Letters, Memorandum, Notices, Agenda & Minutes",
          "Electronic Communication: Email Protocol, Modern Collaboration Tools & Digital Etiquette",
          "Interpersonal & Presentation Skills: Group Discussions, Interviews & Oral Reporting"
        ]
      }
    ]
  },
  {
    id: "2",
    code: "FFCA",
    level: "Foundation",
    group: "Foundation",
    name: "Fundamentals of Financial and Cost Accounting",
    tagline: "Foundation of double-entry bookkeeping, final accounts, and prime cost classification.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Easier to score",
    overview: "Introduces foundational accounting concepts, special commercial transactions, and the essential mechanics of cost sheet formulation.",
    examStrategy: [
      "Master bank reconciliation statements, depreciation calculations, and rectification of errors.",
      "Cost sheet format and prime cost vs conversion cost distinctions are guaranteed exam topics.",
      "Consignment accounting with normal and abnormal loss calculation needs dedicated practice."
    ],
    sections: [
      {
        title: "Section A: Accounting Fundamentals",
        weight: 35,
        description: "Double-entry rules, journalizing, ledger posting, trial balance, and rectification.",
        chapters: [
          "Accounting Principles, Concepts, Conventions & Policies",
          "Capital and Revenue Expenditures & Receipts",
          "Bank Reconciliation Statement (BRS)",
          "Depreciation Accounting: Straight Line, Written Down Value & Change in Method",
          "Rectification of Errors & Suspense Account Treatment",
          "Preparation of Final Accounts of Sole Proprietors (Trading, P&L, Balance Sheet)"
        ]
      },
      {
        title: "Section B: Accounting for Special Transactions",
        weight: 35,
        description: "Treatment of commercial bills, consignment stock, and joint ventures.",
        chapters: [
          "Bills of Exchange: Dishonour, Renewal, Retirement & Accommodation Bills",
          "Consignment Accounts: Valuation of Unsold Stock, Normal & Abnormal Losses, Invoicing above cost",
          "Joint Venture Accounts: Separate Books, Record in one Co-venturer's Books & Memorandum Method"
        ]
      },
      {
        title: "Section C: Fundamentals of Cost Accounting",
        weight: 30,
        description: "Cost concepts, classification by nature, behavior and functions, and Cost Sheet preparation.",
        chapters: [
          "Meaning, Definition, Significance and Objectives of Cost Accounting",
          "Classification of Costs: Direct vs Indirect, Fixed, Variable & Semi-variable",
          "Preparation of Cost Sheet & Production Statement with Treatment of Stocks"
        ]
      }
    ]
  },
  {
    id: "3",
    code: "FBMS",
    level: "Foundation",
    group: "Foundation",
    name: "Fundamentals of Business Mathematics and Statistics",
    tagline: "Quantitative aptitude, financial mathematics, and descriptive statistical analysis.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Medium",
    overview: "Builds quantitative analysis skills covering commercial arithmetic, algebraic techniques, probability, and measures of central tendency.",
    examStrategy: [
      "Arithmetic Progression (AP) and Geometric Progression (GP) formulas provide easy scoring.",
      "Standard Deviation, Variance, and Pearson's Correlation Coefficient are frequent problem areas.",
      "Index numbers (Fisher's ideal index) and simple probability theorems must be memorized."
    ],
    sections: [
      {
        title: "Section A: Business Mathematics",
        weight: 40,
        description: "Commercial calculations, algebra, sequences, and intro calculus.",
        chapters: [
          "Arithmetic: Ratios, Proportions, Variation, Simple & Compound Interest, Annuities",
          "Algebra: Set Theory, Venn Diagrams, Indices, Logarithms",
          "Permutations and Combinations (P&C)",
          "Progressions: Arithmetic Progression (AP) & Geometric Progression (GP)",
          "Quadratic Equations & Basic Concept of Functions"
        ]
      },
      {
        title: "Section B: Business Statistics",
        weight: 60,
        description: "Data presentation, statistical averages, dispersion, correlation, and probability.",
        chapters: [
          "Statistical Representation of Data: Frequency Distributions, Histograms, Ogives",
          "Measures of Central Tendency: Mean (Arithmetic, Geometric, Harmonic), Median & Mode",
          "Measures of Dispersion: Range, Quartile Deviation, Mean Deviation, Standard Deviation & CoV",
          "Correlation and Regression Analysis: Karl Pearson's & Spearman's Rank Correlation",
          "Probability: Basic Theorems, Addition & Multiplication Rules, Conditional Probability",
          "Index Numbers: Laspeyres, Paasche, Bowley & Fisher's Ideal Index, Time Reversal Test"
        ]
      }
    ]
  },
  {
    id: "4",
    code: "FBEM",
    level: "Foundation",
    group: "Foundation",
    name: "Fundamentals of Business Economics and Management",
    tagline: "Microeconomic decision-making, market pricing mechanisms, and organizational management.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Objective & Descriptive",
    scoringDifficulty: "Easier to score",
    overview: "Examines fundamental microeconomic theories of consumer choice, production, and market equilibrium alongside corporate planning and leadership.",
    examStrategy: [
      "Understand price elasticity of demand (point vs arc method) with diagrammatic clarity.",
      "Master differences between Perfect Competition, Monopoly, Monopolistic Competition & Oligopoly.",
      "Henri Fayol's 14 Principles and Taylor's Scientific Management are recurrent theoretical anchors."
    ],
    sections: [
      {
        title: "Section A: Business Economics",
        weight: 70,
        description: "Demand-supply mechanics, elasticity, production functions, costs, and market structures.",
        chapters: [
          "Basic Concepts of Economics: Scarcity, Opportunity Cost, Micro vs Macro",
          "Theory of Demand and Supply: Law of Demand, Elasticity (Price, Income, Cross), Law of Supply",
          "Theory of Production: Production Function, Law of Diminishing Returns, Returns to Scale",
          "Theory of Cost: Short-run vs Long-run Cost Curves (Fixed, Variable, Marginal, Average)",
          "Market Forms & Price Determination: Perfect Competition, Monopoly, Monopolistic, Oligopoly",
          "Money, Banking and Financial System: Functions of Commercial Banks, RBI Monetary Policy"
        ]
      },
      {
        title: "Section B: Fundamentals of Management",
        weight: 30,
        description: "Organizational functions: Planning, Organizing, Staffing, Directing, and Controlling.",
        chapters: [
          "Management Process: Nature, Scope, Classical & Modern Management Schools",
          "Planning: Objectives, Strategies, Policies, Decision-Making Process",
          "Organizing: Organizational Structures, Delegation of Authority, Decentralization",
          "Staffing & Directing: Motivation Theories (Maslow, Herzberg), Leadership Styles, Communication",
          "Coordination and Control: Feedforward, Concurrent & Feedback Control mechanisms"
        ]
      }
    ]
  },

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
  },

  // ================= FINAL GROUP 3 =================
  {
    id: "13",
    code: "CEL",
    level: "Final",
    group: "Group 3",
    name: "Corporate and Economic Laws",
    tagline: "Insolvency & Bankruptcy Code, SEBI regulations, FEMA compliance, and boardroom governance.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Hard",
    overview: "Advanced mastery of corporate litigation, merger schemes, prevention of oppression, Insolvency & Bankruptcy Code (IBC 2016), and foreign exchange regulations.",
    examStrategy: [
      "Insolvency and Bankruptcy Code (IBC 2016) is a heavyweight topic (CIRP process, liquidation, waterfall mechanism).",
      "Corporate restructuring under Companies Act (Compromise, Arrangement, Amalgamation Sections 230-240).",
      "FEMA Current vs Capital account transactions and FDI routes require accurate legal references."
    ],
    sections: [
      {
        title: "Section A: Corporate Laws (Companies Act, 2013)",
        weight: 60,
        description: "Boardroom governance, oppression & mismanagement, mergers, winding up, and corporate criminal liability.",
        chapters: [
          "Board of Directors: Composition, Independent Directors, Woman Director, Board Evaluation",
          "Board Committees: Audit Committee, Nomination & Remuneration, Stakeholders Relationship, Risk Management",
          "Inspection, Inquiry and Investigation under Companies Act, 2013",
          "Compromises, Arrangements and Amalgamations (Sections 230 to 240)",
          "Prevention of Oppression and Mismanagement (Sections 241 to 246)",
          "Winding Up of Companies by Tribunal, Dissolution of Defunct Companies",
          "Corporate Governance & Corporate Fraud (Section 447)"
        ]
      },
      {
        title: "Section B: Economic Laws",
        weight: 40,
        description: "Insolvency and Bankruptcy Code (IBC 2016), SEBI LODR, FEMA, and Competition Law.",
        chapters: [
          "Insolvency and Bankruptcy Code (IBC), 2016: Corporate Insolvency Resolution Process (CIRP), Liquidation waterfall",
          "SEBI Laws: SEBI Act 1992, SEBI (LODR) Regulations, Prohibition of Insider Trading (PIT)",
          "Foreign Exchange Management Act (FEMA), 1999: Current Account vs Capital Account Transactions, ECB, FDI",
          "The Competition Act, 2002: Anti-competitive Agreements, Abuse of Dominant Position, Combinations"
        ]
      }
    ]
  },
  {
    id: "14",
    code: "SFM",
    level: "Final",
    group: "Group 3",
    name: "Strategic Financial Management",
    tagline: "Portfolio optimization, derivatives hedging, bond duration, and foreign exchange risk.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Hard",
    overview: "Advanced financial engineering covering quantitative security analysis, modern portfolio theory, derivatives pricing (Black-Scholes), and international treasury management.",
    examStrategy: [
      "Forex Hedging: Forward contracts, currency options, and money market hedges are guaranteed numerical sums.",
      "Portfolio Management: Markowitz efficient frontier, Beta calculation, Sharpe & Treynor ratios.",
      "Derivatives: Futures pricing, Options delta/gamma, and Black-Scholes formula applications."
    ],
    sections: [
      {
        title: "Section A: Investment Decisions & Financial Markets",
        weight: 25,
        description: "Advanced capital budgeting under risk, real options, and securities valuation.",
        chapters: [
          "Advanced Capital Budgeting: Decision Tree Analysis, Certainty Equivalent, Sensitivity & Scenario Analysis",
          "Real Options in Capital Budgeting: Option to Expand, Abandon, Delay",
          "Security Valuation: Equity Valuation (DDM, Free Cash Flows), Bond Valuation (YTM, Macaulay's Duration, Convexity)"
        ]
      },
      {
        title: "Section B: Portfolio Management",
        weight: 25,
        description: "Modern portfolio theory, CAPM, Arbitrage Pricing Theory, and mutual fund analytics.",
        chapters: [
          "Portfolio Theory: Expected Return & Risk of Multi-Asset Portfolios, Covariance, Correlation",
          "Markowitz Efficient Frontier, Capital Asset Pricing Model (CAPM), Security Market Line (SML)",
          "Arbitrage Pricing Theory (APT) & Multi-factor Models",
          "Portfolio Evaluation: Sharpe Ratio, Treynor Ratio, Jensen's Alpha, Fama's Net Selectivity"
        ]
      },
      {
        title: "Section C: Financial Derivatives",
        weight: 25,
        description: "Forward contracts, financial futures, option strategies, swaps, and credit derivatives.",
        chapters: [
          "Financial Futures: Hedging with Stock and Index Futures, Basis Risk, Optimal Hedge Ratio",
          "Options: Payoff Profiles, Bull/Bear Spreads, Straddles, Strangles, Put-Call Parity",
          "Option Valuation: Binomial Model, Black-Scholes-Merton (BSM) Model, Greeks (Delta, Gamma, Vega, Theta)",
          "Interest Rate Derivatives: Forward Rate Agreements (FRAs), Interest Rate Swaps, Caps, Floors & Collars"
        ]
      },
      {
        title: "Section D: International Financial Management",
        weight: 25,
        description: "Foreign exchange market dynamics, exchange rate determination, and forex risk hedging.",
        chapters: [
          "Forex Markets: Bid-Ask Spreads, Cross Rates, Triangular Arbitrage",
          "Exchange Rate Theories: Purchasing Power Parity (PPP), Interest Rate Parity (IRP), International Fisher Effect",
          "Forex Exposure Management: Transaction, Translation and Economic Exposure Hedging",
          "International Capital Budgeting & Cross-Border Mergers"
        ]
      }
    ]
  },
  {
    id: "15",
    code: "DTIT",
    level: "Final",
    group: "Group 3",
    name: "Direct Tax Laws and International Taxation",
    tagline: "Corporate tax assessment, transfer pricing documentation, DTAA, and BEPS action plans.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Hard",
    overview: "Advanced corporate taxation covering MAT, corporate restructuring tax concessions, transfer pricing audit, General Anti-Avoidance Rules (GAAR), and Double Taxation Avoidance Agreements.",
    examStrategy: [
      "Minimum Alternate Tax (MAT under Section 115JB) and Alternate Minimum Tax (AMT) are high-yield questions.",
      "Transfer Pricing methods (CUP, Resale Price, Cost Plus, TNMM) and Safe Harbour rules.",
      "DTAA relief calculation under Section 90 (bilateral) and Section 91 (unilateral)."
    ],
    sections: [
      {
        title: "Section A: Advanced Direct Tax Laws",
        weight: 70,
        description: "Corporate tax liability, MAT, search & seizure, appeals, revisions, and GAAR.",
        chapters: [
          "Assessment of Corporate Entities, LLPs, Co-operative Societies & Charitable Trusts",
          "Minimum Alternate Tax (MAT - Section 115JB) and Tax on Accreted Income of Trusts",
          "Taxation of Mergers, De-mergers, Slump Sale, and Corporate Restructuring",
          "Search, Seizure and Requisition under Section 132 & Survey Proceedings",
          "Appeals and Revision: CIT(Appeals), Income Tax Appellate Tribunal (ITAT), High Court & Supreme Court",
          "Penalties, Prosecutions and Settlement Mechanism",
          "General Anti-Avoidance Rules (GAAR - Chapter X-A) and Tax Planning vs Evasion"
        ]
      },
      {
        title: "Section B: International Taxation",
        weight: 30,
        description: "DTAA treaties, transfer pricing benchmarking, BEPS action plans, and Equalisation Levy.",
        chapters: [
          "Taxation of Non-Residents and Foreign Companies, Business Connection, Permanent Establishment (PE)",
          "Double Taxation Avoidance Agreements (DTAA): Sections 90, 90A, 91 (Bilateral & Unilateral Relief)",
          "Transfer Pricing Provisions: Associated Enterprises, International Transactions, Arm's Length Price (ALP)",
          "Transfer Pricing Methods: CUP, Resale Price, Cost Plus, Profit Split, Transactional Net Margin Method",
          "Transfer Pricing Documentation: Master File, Local File, Country-by-Country Reporting (CbCR)",
          "Base Erosion and Profit Shifting (BEPS) Action Plans & Equalisation Levy on Digital Transactions"
        ]
      }
    ]
  },
  {
    id: "16",
    code: "SCM",
    level: "Final",
    group: "Group 3",
    name: "Strategic Cost Management",
    tagline: "Lean manufacturing, lifecycle costing, linear programming optimization, and value chain design.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Easier to score",
    overview: "Pivotal CMA Final discipline emphasizing competitive strategic cost design, quantitative optimization models, Target Costing, JIT, Kaizen, and Theory of Constraints.",
    examStrategy: [
      "Target Costing and Life Cycle Costing calculation models carry direct marks.",
      "Learning Curve theory: calculate cost of 8th, 16th, and nth batch with log formulas.",
      "Linear Programming Formulation, Simplex method, and Transportation / Assignment algorithms."
    ],
    sections: [
      {
        title: "Section A: Strategic Cost Management Tools",
        weight: 50,
        description: "Life cycle costing, target costing, Kaizen, value chain, JIT, and TQM.",
        chapters: [
          "Role of Strategic Cost Management in Strategic Positioning and Value Creation",
          "Life Cycle Costing: Stages, Customer Life Cycle Cost, Environmental Cost Management",
          "Target Costing: Target Pricing, Value Engineering, Value Analysis",
          "Kaizen Costing, Total Quality Management (TQM), Costs of Quality (Prevention, Appraisal, Failure)",
          "Just-in-Time (JIT) Production Systems, Backflush Accounting",
          "Theory of Constraints (TOC), Throughput Accounting & Super-variable Costing"
        ]
      },
      {
        title: "Section B: Quantitative Techniques in Decision Making",
        weight: 30,
        description: "Mathematical modeling: Linear programming, transportation, simulation, and learning curves.",
        chapters: [
          "Pricing Decisions: Cost-plus, Penetration, Skimming, Peak-load, Transfer Pricing within Conglomerates",
          "Linear Programming: Formulation, Graphic Solution, Simplex Method, Duality Analysis",
          "Transportation and Assignment Models with Degeneracy and Unbalanced Matrix resolution",
          "Learning Curve Theory: Cumulative Average Time Model, Incremental Hours for Future Batches"
        ]
      },
      {
        title: "Section C: Performance Evaluation & Control",
        weight: 20,
        description: "Benchmarking, balanced scorecard, and operational control frameworks.",
        chapters: [
          "Strategic Benchmarking: Process, Functional, Internal & External Benchmarking",
          "Balanced Scorecard in Multi-division Enterprises & Strategy Mapping",
          "Supply Chain Management & Material Requirements Planning (MRP I and MRP II)"
        ]
      }
    ]
  },

  // ================= FINAL GROUP 4 =================
  {
    id: "17",
    code: "CMAD",
    level: "Final",
    group: "Group 4",
    name: "Cost and Management Audit",
    tagline: "Cost accounting standards, CRA-1 to CRA-4 filings, operational audit, and forensic scrutiny.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Medium",
    overview: "Statutory domain of practicing CMAs under Section 148 of Companies Act 2013, Cost Accounting Standards (CAS 1 to 24), Management Audit, and Forensic Investigations.",
    examStrategy: [
      "Cost Audit applicability criteria under Companies (Cost Records and Audit) Rules 2014 (Table A vs Table B).",
      "Cost Audit forms CRA-1 (Records), CRA-2 (Appointment), CRA-3 (Report), CRA-4 (Filing with MCA).",
      "Cost Accounting Standards (CAS 1 to CAS 24) principles and disclosure requirements."
    ],
    sections: [
      {
        title: "Section A: Cost Audit Framework",
        weight: 50,
        description: "Companies Act Section 148, CRA Rules 2014, Cost Accounting Standards, and Cost Audit reporting.",
        chapters: [
          "Nature, Purpose, and Evolution of Cost Audit, Comparison with Financial Audit",
          "Companies (Cost Records and Audit) Rules, 2014: Applicability thresholds (Regulated vs Non-regulated Sectors)",
          "Cost Auditor: Appointment, Disqualification, Tenure, Remuneration, Rights and Duties",
          "Preparation and Filing of Cost Audit Report in XBRL Format (CRA-1, CRA-2, CRA-3, CRA-4)",
          "Cost Accounting Standards (CAS 1 to 24): In-depth principles, valuation and presentation rules",
          "Generally Accepted Cost Accounting Principles (GACAP)"
        ]
      },
      {
        title: "Section B: Management Audit & Corporate Governance",
        weight: 25,
        description: "Operational review, efficiency assessment, ESG scrutiny, and management performance.",
        chapters: [
          "Meaning, Scope, Need and Techniques of Management Audit",
          "Audit of Corporate Functions: Production, Marketing, Finance, HR, IT, and CSR Audit",
          "Role of Management Auditor in Corporate Governance & Enterprise Risk Management"
        ]
      },
      {
        title: "Section C: Internal Audit & Forensic Investigation",
        weight: 25,
        description: "Standards on Internal Audit (SIA), fraud detection, digital forensics, and whistleblowing.",
        chapters: [
          "Standards on Internal Audit (SIA) issued by the Institute",
          "Forensic Audit: Fraud Triangle, Red Flags, Forensic Investigation Procedures & Evidence Gathering",
          "Anti-Money Laundering (PMLA) Provisions and Whistleblower Mechanism Evaluation"
        ]
      }
    ]
  },
  {
    id: "18",
    code: "CFR",
    level: "Final",
    group: "Group 4",
    name: "Corporate Financial Reporting",
    tagline: "Group consolidation accounting, Ind AS 103 business combinations, and ESG reporting standards.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Computational & Conceptual",
    scoringDifficulty: "Hard",
    overview: "The most prestigious financial reporting paper covering Indian Accounting Standards (Ind AS), Business Combinations (Ind AS 103), Consolidated Financial Statements (Ind AS 110), and BRSR sustainability disclosure.",
    examStrategy: [
      "Consolidation of Financial Statements (Ind AS 110) with Non-Controlling Interest (NCI) and Goodwill / Gain on bargain purchase is mandatory.",
      "Business Combinations (Ind AS 103): Purchase consideration, contingent consideration, acquisition-date fair value.",
      "Financial Instruments (Ind AS 32, 107, 109): Classification as Amortized Cost, FVTOCI, FVTPL."
    ],
    sections: [
      {
        title: "Section A: GAAP & Advanced Ind AS Framework",
        weight: 20,
        description: "Conceptual framework, revenue recognition, leases, and fair value measurement.",
        chapters: [
          "Conceptual Framework for Financial Reporting under Ind AS",
          "Ind AS 115: Revenue from Contracts with Customers (5-Step Model)",
          "Ind AS 116: Leases (Right-of-Use Asset and Lease Liability for Lessees)",
          "Ind AS 19: Employee Benefits (Defined Contribution vs Defined Benefit Plans, Actuarial Assumptions)",
          "Ind AS 113: Fair Value Measurement Framework (Levels 1, 2, and 3 Inputs)"
        ]
      },
      {
        title: "Section B: Business Combinations & Consolidation",
        weight: 35,
        description: "Mergers and acquisitions accounting (Ind AS 103) and group parent-subsidiary consolidation (Ind AS 110).",
        chapters: [
          "Ind AS 103: Business Combinations: Acquisition Method, Fair Value of Assets Acquired, Goodwill Calculation",
          "Ind AS 110: Consolidated Financial Statements: Assessment of Control, Uniform Accounting Policies",
          "Consolidation Adjustments: Elimination of Intra-group balances, Unrealized Profit on Inventory, Dividend distribution",
          "Ind AS 111: Joint Arrangements & Ind AS 28: Investments in Associates and Joint Ventures"
        ]
      },
      {
        title: "Section C: Financial Instruments & Special Accounting",
        weight: 25,
        description: "Ind AS 109 financial assets and liabilities, compound instruments, and share-based payments.",
        chapters: [
          "Ind AS 32: Financial Instruments Presentation: Liability vs Equity Classification, Compound Instruments",
          "Ind AS 109: Financial Instruments Recognition and Measurement: ECL Model, Hedge Accounting",
          "Ind AS 102: Share-based Payment: Equity-settled vs Cash-settled Plans, Vesting Conditions"
        ]
      },
      {
        title: "Section D: Sustainability & Non-Financial Reporting",
        weight: 20,
        description: "Integrated reporting, ESG metrics, BRSR framework, and value added statements.",
        chapters: [
          "Integrated Reporting (IR) Framework: Six Capitals (Financial, Manufactured, Intellectual, Human, Social, Natural)",
          "Business Responsibility and Sustainability Reporting (BRSR) under SEBI Mandate",
          "Environmental, Social and Governance (ESG) Disclosures and Value Added Statements"
        ]
      }
    ]
  },
  {
    id: "19",
    code: "ITLP",
    level: "Final",
    group: "Group 4",
    name: "Indirect Tax Laws and Practice",
    tagline: "Advanced GST audit, refund mechanics, search & arrest powers, customs litigation, and FTP.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Hard",
    overview: "Specialized mastery of Goods & Services Tax dispute resolution, GST refunds, audit mechanisms, appellate remedies, advanced customs adjudication, and Foreign Trade Policy incentives.",
    examStrategy: [
      "GST Refund rules under Section 54 (inverted duty structure, zero-rated supplies) require precise formula application.",
      "Search, Seizure, and Arrest provisions under GST (Section 67 & 69) and compounding of offenses.",
      "Customs Duty exemptions, Duty Drawback, Advance Authorisation, and EPCG schemes under Foreign Trade Policy."
    ],
    sections: [
      {
        title: "Section A: Advanced GST Law & Procedures",
        weight: 80,
        description: "Complex supply determinations, input tax credit reversals, GST audits, refunds, and appeals.",
        chapters: [
          "Place of Supply for Goods & Services: Cross-border, Inter-state, B2B vs B2C rules",
          "Advanced Input Tax Credit: Rule 42 & 43 Reversals for exempt supplies and capital goods",
          "Refunds under GST: Export of Goods/Services without payment of tax, Inverted Duty Structure",
          "Assessment and Audit under GST: Scrutiny of Returns, Departmental Audit, Special Audit",
          "Inspection, Search, Seizure, Arrest, Demand and Recovery Provisions (Sections 73 and 74)",
          "Appeals and Revision under GST: First Appellate Authority, GST Appellate Tribunal (GSTAT), High Court",
          "Advance Rulings, Anti-profiteering Authority & Offenses and Penalties"
        ]
      },
      {
        title: "Section B: Customs Law and Foreign Trade Policy (FTP)",
        weight: 20,
        description: "Valuation of international shipments, transit warehousing, SEZ rules, and export promotion.",
        chapters: [
          "Advanced Customs Valuation: Related Party Transactions, SVB Proceedings, Deductive & Computed Value",
          "Warehousing Provisions, Duty Drawback Rules (Sections 74 and 75)",
          "Foreign Trade Policy (FTP): Advance Authorisation, EPCG Scheme, RoDTEP, SEZ Act & EOUs"
        ]
      }
    ]
  },
  {
    id: "20A",
    code: "SPMBV",
    level: "Final",
    group: "Group 4",
    name: "Strategic Performance Management and Business Valuation",
    tagline: "Elective 1: Corporate performance benchmarking, enterprise risk management, and M&A valuation.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Easier to score",
    overview: "The flagship elective for corporate finance aspirants. Covers performance measurement frameworks, ERM, DCF business valuation, relative multiples, and brand evaluation.",
    examStrategy: [
      "DCF Valuation: Free Cash Flow to Firm (FCFF) and Equity (FCFE) with WACC discounting.",
      "Relative Valuation: Enterprise Value to EBITDA, P/E ratios, and Price to Book Value.",
      "Altman's Z-Score model for bankruptcy prediction and Economic Value Added (EVA) calculation."
    ],
    sections: [
      {
        title: "Section A: Strategic Performance Management",
        weight: 50,
        description: "Performance evaluation metrics, supply chain management, risk management, and distress prediction.",
        chapters: [
          "Performance Management: Dimensions, Financial vs Non-financial Performance Measures",
          "Economic Value Added (EVA), Market Value Added (MVA), Shareholder Value Added (SVA)",
          "Supply Chain Management (SCM) & Customer Relationship Management (CRM) Performance Metrics",
          "Enterprise Risk Management (ERM): COSO Framework, Risk Identification, Assessment, and Mitigation",
          "Corporate Failure Prediction Models: Altman Z-score Model, Springate Model, Zmijewski Model"
        ]
      },
      {
        title: "Section B: Business Valuation",
        weight: 50,
        description: "Asset-based, earnings-based, and market-based valuation models for M&A and intangibles.",
        chapters: [
          "Valuation Basics: Principles, Purpose, Fair Value vs Investment Value, Statutory Valuation requirements",
          "Asset-based Valuation: Book Value, Net Realizable Value, Replacement Cost Method",
          "Income-based Valuation: Discounted Cash Flow (DCF), FCFF, FCFE, Capitalization of Earnings Method",
          "Market-based Valuation: Comparable Companies Multiples (P/E, EV/EBITDA, EV/Sales, P/BV)",
          "Valuation of Intangibles: Brand Valuation (Interbrand Model), Human Resource Valuation, Goodwill",
          "Valuation in Mergers and Acquisitions: Swap Ratio, Exchange Ratio, Synergies and Post-merger Value"
        ]
      }
    ]
  },
  {
    id: "20B",
    code: "RMBI",
    level: "Final",
    group: "Group 4",
    name: "Risk Management in Banking and Insurance",
    tagline: "Elective 2: Basel III banking capital norms, credit risk modeling, and insurance actuarial standards.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Medium",
    overview: "Specialized financial sector elective covering Basel III regulatory capital, credit rating mechanics, liquidity risk, insurance underwriting, and Solvency II regimes.",
    examStrategy: [
      "Basel III Capital Adequacy Ratio (CAR), Tier 1 & Tier 2 capital requirements, and Leverage Ratio.",
      "Credit Risk: Credit default swaps, probability of default (PD), loss given default (LGD).",
      "Insurance Underwriting: Loss ratio, expense ratio, combined ratio, and reinsurance structures."
    ],
    sections: [
      {
        title: "Section A: Risk Management in Banking",
        weight: 50,
        description: "Credit risk, market risk, operational risk, ALM, and Basel III regulations.",
        chapters: [
          "Banking System in India: Commercial Banks, NBFCs, RBI Regulatory Architecture",
          "Types of Risks in Banks: Credit Risk, Market Risk, Operational Risk, Liquidity Risk, Interest Rate Risk",
          "Asset Liability Management (ALM): Maturity Gap Analysis, Duration Gap Model",
          "Basel III Framework: Capital Adequacy Ratio (CAR), Common Equity Tier 1 (CET1), Capital Conservation Buffer",
          "Credit Risk Management: Credit Rating Models, Non-Performing Assets (NPA) Resolution & SARFAESI Act"
        ]
      },
      {
        title: "Section B: Risk Management in Insurance",
        weight: 50,
        description: "Life and general insurance principles, actuarial pricing, solvency norms, and reinsurance.",
        chapters: [
          "Insurance Principles: Utmost Good Faith, Insurable Interest, Indemnity, Subrogation, Proximate Cause",
          "Underwriting Process: Risk Selection, Rating, Claims Management and Fraud Prevention",
          "Actuarial Principles: Mortality Tables, Premium Calculation, Valuation of Liabilities",
          "Reinsurance: Treaty vs Facultative Reinsurance, Quota Share, Surplus and Excess of Loss covers",
          "Solvency Margins and IRDAI Regulatory Framework for Insurers"
        ]
      }
    ]
  },
  {
    id: "20C",
    code: "ENST",
    level: "Final",
    group: "Group 4",
    name: "Entrepreneurship and Startup",
    tagline: "Elective 3: Venture creation, angel & VC financing rounds, cap tables, and unicorn scale-up.",
    totalMarks: 100,
    duration: "3 Hours",
    examNature: "Case Analysis & Problem Solving",
    scoringDifficulty: "Easier to score",
    overview: "Contemporary entrepreneurship paper covering startup ideation, lean canvas modeling, venture capital funding, valuation of early-stage tech ventures, and IPO exit strategies.",
    examStrategy: [
      "Startup financing stages: Bootstrapping, Angel investors, Seed, Series A/B/C, and Venture Capital.",
      "Early-stage valuation models: Berkus method, Scorecard method, First Chicago method.",
      "Cap table mechanics, convertible notes, SAFE agreements, and liquidation preference terms."
    ],
    sections: [
      {
        title: "Section A: Entrepreneurship Dynamics & Ideation",
        weight: 50,
        description: "Opportunity discovery, business model canvas, minimum viable product (MVP), and legal setups.",
        chapters: [
          "Entrepreneurial Mindset, Opportunity Identification, Feasibility Analysis",
          "Business Model Canvas (BMC), Lean Startup Methodology, Building the Minimum Viable Product (MVP)",
          "Legal Structure of Startups: Private Limited Company, One Person Company (OPC), LLP",
          "Intellectual Property Rights (IPR): Patents, Trademarks, Copyrights, Trade Secrets Protection",
          "Startup India Initiative: Eligibility, Tax Exemptions (Section 54GB, 80-IAC), Government Schemes"
        ]
      },
      {
        title: "Section B: Financing and Scaling Startups",
        weight: 50,
        description: "Venture capital, angel syndicates, term sheets, cap table dilution, and IPO exits.",
        chapters: [
          "Startup Financing Lifecycle: Bootstrapping, Incubators, Accelerators, Angel Investors, Venture Capital",
          "Term Sheet Fundamentals: Pre-money vs Post-money Valuation, SAFE Notes, Convertible Debentures",
          "Cap Table Management, Dilution, ESOP Pools, Liquidation Preference, Anti-dilution Clauses",
          "Valuation of Early-stage Startups: Berkus Method, Scorecard Method, Venture Capital Method",
          "Scaling Operations, Growth Hacking, Unit Economics (CAC, LTV, Burn Rate), Exit Strategies (M&A, IPO)"
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
