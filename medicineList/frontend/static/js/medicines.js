// Medicine Database - Auto-complete data extracted from Medicine Names_Sep24.pdf
const medicineDatabase = [
    {
        name: "THYRONORM",
        genericName: "THYROXINE",
        dose: "50mg",
        usedFor: "Thyroid"
    },
    {
        name: "EMPALINA 10/5",
        genericName: "Empagliflozin + Linagliptin",
        dose: "10mg/5mg",
        usedFor: "Diabetics Controller"
    },
    {
        name: "EXIUM / ESORAL MUPS",
        genericName: "Esomeprazole",
        dose: "20mg",
        usedFor: "Gastric"
    },
    {
        name: "LIPAGLYN",
        genericName: "SAROGLITAZAR",
        dose: "4mg",
        usedFor: "Fatty liver & Cholesterol"
    },
    {
        name: "CIDMUS 50",
        genericName: "SACUBITRIL VALSARTAN",
        dose: "24mg/26mg",
        usedFor: "Heart - Medication"
    },
    {
        name: "ECOSPRIN",
        genericName: "ASPIRIN",
        dose: "75mg",
        usedFor: "Blood Thinner for Heart"
    },
    {
        name: "LANOXIN",
        genericName: "DIGOXIN",
        dose: "0.25mg",
        usedFor: "Heart Rhythm Control"
    },
    {
        name: "OSTEOFOS",
        genericName: "ALENDRONATE",
        dose: "35mg",
        usedFor: "Bone health"
    },
    {
        name: "SHELCAL HD",
        genericName: "CALCIUM + VITAMIN D3",
        dose: "500mg/500 IU",
        usedFor: "Bone health"
    },
    {
        name: "ITOKINE",
        genericName: "ITOPRIDE",
        dose: "50mg",
        usedFor: "Gastric, Vomit"
    },
    {
        name: "RECLIDE",
        genericName: "GLICLAZIDE",
        dose: "40mg",
        usedFor: "Reduce SUGAR"
    },
    {
        name: "IVABEAT / IVAPREX",
        genericName: "IVABRADINE",
        dose: "5mg",
        usedFor: "Heartbeat Control"
    },
    {
        name: "CINARON PLUS",
        genericName: "CINNARIZINE + DIMENHYDRINATE",
        dose: "20mg/40mg",
        usedFor: "Vertigo"
    },
    {
        name: "URIMAX-D",
        genericName: "TAMSULOSIN + DUTASTERIDE",
        dose: "0.4mg/0.5mg",
        usedFor: "Urine"
    },
    {
        name: "EPTUS",
        genericName: "EPLERENONE",
        dose: "25mg",
        usedFor: "Reduce salt through Urine"
    },
    {
        name: "ANGITOR / ATOVA",
        genericName: "ATOVASTATIN",
        dose: "10mg",
        usedFor: "Cholesterol"
    },
    {
        name: "MONTAIR",
        genericName: "MONTELUKAST",
        dose: "10mg",
        usedFor: "Cold"
    },
    {
        name: "RESTYL",
        genericName: "ALPRAZOLAM",
        dose: "0.5mg",
        usedFor: "Sleeping Medication"
    }
];

// Search medicine by name (partial match)
function searchMedicine(query) {
    if (!query || query.length < 2) return [];
    const lowerQuery = query.toLowerCase();
    return medicineDatabase.filter(med => 
        med.name.toLowerCase().includes(lowerQuery) ||
        med.genericName.toLowerCase().includes(lowerQuery)
    );
}

// Get medicine details by exact name
function getMedicineByName(name) {
    return medicineDatabase.find(med => 
        med.name.toLowerCase() === name.toLowerCase()
    );
}

// Get all medicine names for dropdown
function getAllMedicineNames() {
    return medicineDatabase.map(med => med.name);
}
