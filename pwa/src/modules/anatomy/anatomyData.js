export const bodySystems = [
  { id: "all", name: "All Systems", color: "#2F6F5E" },
  { id: "Cardiovascular", name: "Cardiovascular", color: "#EE7C6A" },
  { id: "Nervous System", name: "Nervous System", color: "#C58696" },
  { id: "Respiratory System", name: "Respiratory", color: "#DD8F8B" },
  { id: "Urinary System", name: "Urinary & Renal", color: "#6393D8" },
  { id: "Sensory System", name: "Sensory & Special Organs", color: "#F2A33B" },
  { id: "Digestive System", name: "Digestive System", color: "#549E79" },
  { id: "Integumentary System", name: "Skin", color: "#D9822B" },
];

export const organs = [
  {
    id: "heart",
    name: "Heart",
    scientificName: "Cor",
    system: "Cardiovascular",
    icon: "🫀",
    accent: "#EE7C6A",
    description: "A muscular organ that pumps blood continuously throughout the circulatory system, delivering oxygen and nutrients to every cell in the body.",
    poetic: "The indefatigable rhythm of life",
    size: "About the size of a closed fist",
    weight: "250 – 350 grams",
    location: "In the middle mediastinum of the chest, behind the sternum",
    function: "Circulates oxygenated blood to tissues and sends deoxygenated blood to the lungs.",
    dailyFact: "Beats approximately 100,000 times a day and pumps over 2,000 gallons of blood.",
    medical: "Composed of four chambers: two atria and two ventricles, governed by cardiac pacemaker SA node.",
    bloodSupply: "Left and Right Coronary Arteries",
    funFact: "The heart produces enough energy daily to drive a truck 20 miles.",
    tissue: "Cardiac Muscle (Myocardium)",
    comparison: "Heart vs. Brain oxygen consumption",
    conditions: [
      "Coronary Artery Disease",
      "Arrhythmia",
      "Heart Valve Disorders",
      "Congestive Heart Failure",
      "Myocarditis",
      "Hypertrophic Cardiomyopathy"
    ],
    hotspots: [
      { id: "aorta", label: "Aorta", detail: "Largest artery in the body, carrying oxygen-rich blood from the left ventricle to systemic circulation.", position: [-0.35, 1.65, 0.55], color: "#EE7C6A" },
      { id: "left-atrium", label: "Left Atrium", detail: "Receives oxygenated blood from pulmonary veins.", position: [0.82, 0.65, 0.5], color: "#F2A33B" },
      { id: "right-atrium", label: "Right Atrium", detail: "Receives deoxygenated venous blood from superior and inferior vena cava.", position: [-0.9, 0.35, 0.55], color: "#6393D8" },
      { id: "left-ventricle", label: "Left Ventricle", detail: "Thickest muscular chamber; pumps blood into systemic circulation.", position: [0.7, -0.75, 0.65], color: "#F2A33B" },
      { id: "right-ventricle", label: "Right Ventricle", detail: "Pumps deoxygenated blood into the pulmonary artery toward lungs.", position: [-0.65, -0.68, 0.66], color: "#EE7C6A" },
      { id: "mitral-valve", label: "Mitral (Bicuspid) Valve", detail: "Prevents backflow of blood between left atrium and left ventricle.", position: [0.18, -1.35, 0.48], color: "#D89BC4" }
    ]
  },
  {
    id: "brain",
    name: "Brain",
    scientificName: "Encephalon",
    system: "Nervous System",
    icon: "🧠",
    accent: "#C58696",
    description: "The primary control center of the nervous system, processing sensory information, regulating body functions, cognition, memory, and emotions.",
    poetic: "The universe within human thought",
    size: "Approximately 15 cm in length, about 2 fists together",
    weight: "1.3 – 1.4 kilograms",
    location: "Protected within the cranial cavity of the skull",
    function: "Integrates motor output, sensory input, memory retention, reasoning, and involuntary reflexes.",
    dailyFact: "Contains nearly 86 billion neurons and consumes 20% of the body's total metabolic energy.",
    medical: "Divided into Cerebrum, Cerebellum, and Brainstem, surrounded by meninges and cerebrospinal fluid.",
    bloodSupply: "Internal Carotid and Vertebral Arteries (Circle of Willis)",
    funFact: "The brain has no pain receptors itself; brain surgery can be performed while patients are awake.",
    tissue: "Gray & White Neural Tissue, Glial Cells",
    comparison: "Brain vs. Eye neural bandwidth",
    conditions: [
      "Stroke (Ischemic/Hemorrhagic)",
      "Epilepsy & Seizures",
      "Alzheimer's Disease",
      "Parkinson's Disease",
      "Migraine",
      "Meningitis",
      "Traumatic Brain Injury (TBI)"
    ],
    hotspots: [
      { id: "frontal-lobe", label: "Frontal Lobe", detail: "Responsible for decision-making, executive function, problem solving, and voluntary movement.", position: [-0.7, 0.65, 0.8], color: "#EE7C6A" },
      { id: "parietal-lobe", label: "Parietal Lobe", detail: "Processes tactile sensory information like touch, temperature, pressure, and spatial sense.", position: [0.15, 1.1, 0.65], color: "#F2A33B" },
      { id: "temporal-lobe", label: "Temporal Lobe", detail: "Crucial for memory formation (hippocampus), language comprehension (Wernicke), and hearing.", position: [0.75, -0.1, 0.82], color: "#6393D8" },
      { id: "cerebellum", label: "Cerebellum", detail: "Controls fine motor skills, posture, balance, and motor learning coordination.", position: [0.72, -0.9, 0.55], color: "#D89BC4" },
      { id: "brainstem", label: "Brainstem", detail: "Regulates vital cardiac and respiratory functions (medulla, pons, midbrain).", position: [0.0, -1.2, 0.2], color: "#549E79" }
    ]
  },
  {
    id: "lungs",
    name: "Lungs",
    scientificName: "Pulmones",
    system: "Respiratory System",
    icon: "🫁",
    accent: "#DD8F8B",
    description: "Paired spongy organs responsible for respiration—extracting oxygen from inhaled air into the bloodstream and exhaling carbon dioxide waste.",
    poetic: "The vital bellows of atmospheric exchange",
    size: "About 25 cm high; total alveolar surface area ~70 m²",
    weight: "Left lung ~560g, Right lung ~620g",
    location: "Thoracic cavity on either side of the heart, inside the rib cage",
    function: "Gaseous exchange between atmospheric air and pulmonary capillary blood.",
    dailyFact: "You take roughly 20,000 breaths per day, inhaling over 11,000 liters of air.",
    medical: "The right lung has 3 lobes (Superior, Middle, Inferior) while the left lung has 2 lobes to accommodate the heart cardiac notch.",
    bloodSupply: "Pulmonary Arteries (deoxygenated) & Bronchial Arteries (oxygenated)",
    funFact: "If spread flat, the surface area of both human lungs would cover a singles tennis court.",
    tissue: "Alveolar Epithelium, Elastic Connective Tissue",
    comparison: "Lungs vs. Heart chest volume",
    conditions: [
      "Asthma",
      "Chronic Obstructive Pulmonary Disease (COPD)",
      "Pneumonia",
      "Pulmonary Fibrosis",
      "Pneumothorax",
      "Bronchitis",
      "Pulmonary Embolism"
    ],
    hotspots: [
      { id: "trachea", label: "Trachea & Bronchi", detail: "Windpipe conducting ambient air down into mainstem left and right bronchi.", position: [0.0, 1.4, 0.2], color: "#549E79" },
      { id: "right-upper-lobe", label: "Right Upper Lobe", detail: "Superior lobe of the right lung receiving primary air branching.", position: [-0.9, 0.8, 0.4], color: "#EE7C6A" },
      { id: "left-upper-lobe", label: "Left Upper Lobe", detail: "Contains the cardiac notch where the apex of the heart rests.", position: [0.9, 0.7, 0.4], color: "#F2A33B" },
      { id: "alveoli-zone", label: "Alveolar Zone", detail: "Microscopic air sacs surrounded by capillaries for gas diffusion.", position: [0.6, -0.6, 0.5], color: "#6393D8" }
    ]
  },
  {
    id: "kidneys",
    name: "Kidneys",
    scientificName: "Renes",
    system: "Urinary System",
    icon: "🫘",
    accent: "#6393D8",
    description: "Bean-shaped excretory organs that filter blood, remove metabolic waste, balance fluid and electrolytes, and regulate blood pressure.",
    poetic: "The silent guardians of internal chemistry",
    size: "10 – 12 cm long, 5 – 7 cm wide",
    weight: "130 – 160 grams each",
    location: "Retroperitoneal space on the posterior abdominal wall (T12 to L3)",
    function: "Blood filtration, urine production, hormone secretion (Erythropoietin, Renin).",
    dailyFact: "Filters around 180 liters of fluid daily, reabsorbing 99% back into blood to form ~1.5L urine.",
    medical: "Contains approximately 1 million microscopic filtering units called nephrons in each kidney.",
    bloodSupply: "Renal Arteries directly branching from the Abdominal Aorta",
    funFact: "All the blood in your body passes through your kidneys about 40 times a day.",
    tissue: "Renal Cortex, Renal Medulla, Nephrons",
    comparison: "Kidney vs. Liver filtration rate",
    conditions: [
      "Chronic Kidney Disease (CKD)",
      "Kidney Stones (Nephrolithiasis)",
      "Glomerulonephritis",
      "Polycystic Kidney Disease (PKD)",
      "Pyelonephritis",
      "Acute Kidney Injury"
    ],
    hotspots: [
      { id: "renal-cortex", label: "Renal Cortex", detail: "Outer reddish region containing the glomeruli and proximal/distal convoluted tubules.", position: [-0.8, 0.6, 0.5], color: "#6393D8" },
      { id: "renal-pyramids", label: "Renal Medulla & Pyramids", detail: "Inner section containing loops of Henle and collecting ducts.", position: [-0.2, 0.1, 0.5], color: "#F2A33B" },
      { id: "renal-pelvis", label: "Renal Pelvis", detail: "Funnel-shaped structure gathering urine into the ureter.", position: [0.3, -0.2, 0.4], color: "#EE7C6A" },
      { id: "ureter", label: "Ureter", detail: "Muscular tube propelling urine down to the urinary bladder.", position: [0.4, -1.2, 0.2], color: "#549E79" }
    ]
  },
  {
    id: "eyeball",
    name: "Eyeball & Vision",
    scientificName: "Oculus",
    system: "Sensory System",
    icon: "👁️",
    accent: "#F2A33B",
    description: "The complex sensory organ that captures light reflections, focusing images onto the retina to enable visual perception.",
    poetic: "The window of the mind to the physical light",
    size: "About 24 millimeters in diameter",
    weight: "7.5 grams",
    location: "Orbit socket of the skull, supported by 6 extraocular muscles",
    function: "Refracts light through cornea and lens to convert light photons into optical nerve signals.",
    dailyFact: "Processes more than 36,000 bits of visual information every single hour.",
    medical: "Contains photoreceptors: ~120 million rods (night/motion) and ~6 million cones (color/detail).",
    bloodSupply: "Ophthalmic Artery and Central Retinal Artery",
    funFact: "Your eyes adjust focus instantly and can distinguish over 10 million distinct colors.",
    tissue: "Cornea, Sclera, Retina, Choroid",
    comparison: "Eye vs. Camera optics",
    conditions: [
      "Cataracts",
      "Glaucoma",
      "Macular Degeneration",
      "Myopia / Hyperopia",
      "Retinal Detachment",
      "Astigmatism"
    ],
    hotspots: [
      { id: "cornea", label: "Cornea", detail: "Clear outer dome providing 65-75% of the eye's total focusing power.", position: [0.0, 0.0, 1.2], color: "#F2A33B" },
      { id: "iris-pupil", label: "Iris & Pupil", detail: "Colored muscular ring controlling pupil aperture for light entry.", position: [0.0, 0.0, 0.9], color: "#EE7C6A" },
      { id: "crystalline-lens", label: "Crystalline Lens", detail: "Flexible transparent structure accommodating fine visual focus.", position: [0.0, 0.0, 0.6], color: "#549E79" },
      { id: "retina-fovea", label: "Retina & Fovea", detail: "Light-sensitive nerve layer lining the back surface of the eye.", position: [0.0, 0.0, -0.9], color: "#6393D8" },
      { id: "optic-nerve", label: "Optic Nerve (CN II)", detail: "Transmits visual impulses directly to the visual cortex in occipital lobe.", position: [0.3, -0.4, -1.3], color: "#D89BC4" }
    ]
  },
  {
    id: "liver",
    name: "Liver",
    scientificName: "Hepar",
    system: "Digestive System",
    icon: "🍗",
    accent: "#549E79",
    description: "The body's largest internal metabolic factory, performing over 500 vital chemical functions including detoxification, bile synthesis, and nutrient storage.",
    poetic: "The master alchemist of bodily nourishment",
    size: "About 15 – 22 cm wide",
    weight: "1.4 – 1.6 kilograms",
    location: "Right upper quadrant of the abdomen, immediately beneath the diaphragm",
    function: "Detoxifies metabolic waste, produces bile for fat digestion, stores glycogen, synthesizes plasma proteins.",
    dailyFact: "Secrets 800 to 1,000 mL of digestive bile every day.",
    medical: "Unique among organs for its ability to regenerate fully from as little as 25% of healthy tissue.",
    bloodSupply: "Hepatic Artery (25% oxygenated) & Hepatic Portal Vein (75% nutrient-rich from gut)",
    funFact: "The liver is the only organ in the human body capable of complete natural regeneration.",
    tissue: "Hepatocytes arranged in hepatic lobules",
    comparison: "Liver vs. Kidney detoxification",
    conditions: [
      "Non-Alcoholic Fatty Liver Disease (NAFLD)",
      "Hepatitis (A, B, C)",
      "Cirrhosis",
      "Jaundice",
      "Gallstones (Choledocholithiasis)"
    ],
    hotspots: [
      { id: "right-lobe", label: "Right Lobe", detail: "Largest lobe of the liver, occupying the right hypochondrium.", position: [-0.6, 0.2, 0.5], color: "#549E79" },
      { id: "left-lobe", label: "Left Lobe", detail: "Smaller, flattened lobe extending across the epigastrium.", position: [0.7, 0.3, 0.4], color: "#F2A33B" },
      { id: "gallbladder", label: "Gallbladder", detail: "Pear-shaped sac nestled beneath the liver that concentrates and stores bile.", position: [-0.4, -0.8, 0.6], color: "#EE7C6A" },
      { id: "portal-triad", label: "Portal Triad", detail: "Conduit containing the hepatic portal vein, hepatic artery, and common bile duct.", position: [0.1, -0.4, 0.5], color: "#6393D8" }
    ]
  },
  {
    id: "skin",
    name: "Skin",
    scientificName: "Integumentum Commune",
    system: "Integumentary System",
    icon: "🖐️",
    accent: "#D9822B",
    description: "The body's largest organ, forming an anatomical barrier against environmental pathogens, UV radiation, desiccation, and thermal loss.",
    poetic: "The tactile interface between self and world",
    size: "Covers ~1.5 to 2.0 square meters surface area",
    weight: "Accounts for ~16% of adult body weight",
    location: "External envelope of the human body",
    function: "Thermoregulation, cutaneous sensation, vitamin D synthesis, pathogen defense.",
    dailyFact: "Sheds roughly 30,000 to 40,000 dead skin cells every single minute.",
    medical: "Consists of three distinct layers: Epidermis, Dermis, and Hypodermis (Subcutaneous tissue).",
    bloodSupply: "Cutaneous Plexus & Subpapillary Microvascular Network",
    funFact: "Your skin completely renews itself every 28 to 30 days.",
    tissue: "Stratified Squamous Epithelium & Dense Irregular Connective Tissue",
    comparison: "Epidermis vs. Dermis nerve density",
    conditions: [
      "Eczema & Atopic Dermatitis",
      "Psoriasis",
      "Melanoma & Skin Cancers",
      "Acne Vulgaris",
      "Burns (1st, 2nd, 3rd Degree)",
      "Vitiligo"
    ],
    hotspots: [
      { id: "epidermis", label: "Epidermis", detail: "Avascular outer layer containing keratinocytes, melanocytes, and Langerhans cells.", position: [0.0, 0.8, 0.6], color: "#D9822B" },
      { id: "dermis", label: "Dermis", detail: "Thick vascular layer housing hair follicles, sweat glands, nerve endings, and collagen.", position: [0.0, 0.2, 0.5], color: "#EE7C6A" },
      { id: "sweat-gland", label: "Eccrine Sweat Glands", detail: "Secrete water and electrolytes onto skin surface for evaporative cooling.", position: [-0.5, -0.3, 0.5], color: "#6393D8" },
      { id: "tactile-corpuscle", label: "Tactile Corpuscles (Meissner)", detail: "Specialized mechanoreceptors sensitive to light touch and low-frequency vibrations.", position: [0.5, -0.4, 0.5], color: "#F2A33B" }
    ]
  }
];

export const anatomyQuizzes = [
  {
    id: "q1",
    organId: "heart",
    question: "Which chamber of the heart pumps oxygenated blood out into the body via the aorta?",
    options: ["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"],
    correctIndex: 3,
    explanation: "The left ventricle has the thickest muscular wall to generate high pressure required to pump oxygen-rich blood through the aorta to systemic tissues."
  },
  {
    id: "q2",
    organId: "brain",
    question: "Which part of the brain is primarily responsible for balance, posture, and fine motor movement?",
    options: ["Frontal Lobe", "Cerebellum", "Temporal Lobe", "Hypothalamus"],
    correctIndex: 1,
    explanation: "The Cerebellum ('little brain') situated at the back of the skull coordinates muscle contractions, balance, and spatial orientation."
  },
  {
    id: "q3",
    organId: "lungs",
    question: "What is the name of the microscopic air sacs in the lungs where gas exchange occurs?",
    options: ["Bronchioles", "Alveoli", "Trachea", "Pleura"],
    correctIndex: 1,
    explanation: "Alveoli are microscopic grape-like sacs surrounded by blood capillaries where oxygen diffuses into blood and carbon dioxide diffuses out."
  },
  {
    id: "q4",
    organId: "kidneys",
    question: "Approximately how many functional filtering units (nephrons) are located in each human kidney?",
    options: ["100,000", "500,000", "1 Million", "10 Million"],
    correctIndex: 2,
    explanation: "Each adult kidney contains roughly 1 million nephrons responsible for filtering blood, balancing electrolytes, and concentrating urine."
  },
  {
    id: "q5",
    organId: "liver",
    question: "Which organ produces bile to assist in fat digestion?",
    options: ["Pancreas", "Gallbladder", "Liver", "Stomach"],
    correctIndex: 2,
    explanation: "The Liver produces bile continuously, which is then stored and concentrated by the gallbladder until needed for intestinal digestion."
  }
];
