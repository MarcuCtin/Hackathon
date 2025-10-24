# AI Auto-Logging Guide

## Overview

AI-ul detectează automat și loghează toate informațiile despre nutriție, somn, hidratare și workout din mesajele tale.

## Cum Funcționează

### 1. **Scrii în Chat**

Te exprimi natural, de exemplu:

- "Am mâncat somon cu quinoa și broccoli la cină"
- "Am dormit 7 ore"
- "Am băut 5 pahare de apă"
- "Am făcut cardio 45 de minute"

### 2. **AI Detectează Automat**

AI-ul analizează mesajul și identifică:

- **Tip de acțiune** (meal_log, sleep_log, water_log, workout_log)
- **Detalii** (calorii, ore, cantitate, tip de mâncare)
- **Categoria mesei** (breakfast, lunch, dinner, snack)

### 3. **Se Loghează Automat în Backend**

Toate datele sunt salvate în baza de date:

- **NutritionLog** - pentru mese (cu calorii, proteine, carbs, grasimi)
- **Log** - pentru apă, somn, workout
- **Micronutrienți** - estimați automat pe baza tipului de mâncare

### 4. **Primești Confirmare**

AI-ul îți confirmă ce a fost logat:

```
✓ Logged meal: salmon with quinoa and broccoli 450 cal (micronutrients: omega3, iron, folate, zinc)
```

## Exemple de Mesaje

### Mese (Meal Logging)

```
"Am mâncat somon la cină"
→ Loghează: mealType: dinner, calories: 400, omega3: 750mg, vitaminD: 7mcg

"Am luat mic dejun cu ouă și avocado"
→ Loghează: mealType: breakfast, calories: 350, protein: 20g, folate: 60mcg

"Am mâncat salată cu spanac și migdale"
→ Loghează: mealType: lunch, calories: 300, iron: 4mg, calcium: 150mg, magnesium: 100mg
```

### Somn (Sleep Logging)

```
"Am dormit 7 ore săptămâna trecută"
→ Loghează: type: sleep, value: 7, unit: hours

"Mi-am petrecut 8 ore în pat"
→ Loghează: type: sleep, value: 8, unit: hours
```

### Hidratare (Water Logging)

```
"Am băut 5 pahare de apă"
→ Loghează: type: hydration, value: 5, unit: glasses

"Am băut 2 litri de apă"
→ Loghează: type: hydration, value: 2, unit: liters
```

### Workout (Exercise Logging)

```
"Am făcut cardio 45 de minute"
→ Loghează: type: workout, value: 45, unit: minutes, category: cardio

"Am ars 500 calorii la sală"
→ Loghează: type: workout, value: 500, unit: calories
```

## Micronutrienți Estimați Automat

### Pește (Salmon, Tuna)

- Omega-3: 500-1000mg
- Vitamin D: 5-10mcg
- Proteine: înalte

### Lapte/Dairy (Milk, Yogurt, Cheese)

- Calciu: 200-300mg
- Vitamin D: 1-2mcg

### Verdețuri (Spinach, Kale)

- Fier: 2-4mg
- Folat: 100-200mcg
- Calciu: 50-100mg

### Nuci (Almonds, Walnuts)

- Magneziu: 50-100mg
- Fier: 1-2mg
- Grăsimi sănătoase

### Ouă

- Proteine complete
- Vitamin D: 1mcg
- B12: 0.5mcg
- Folat: 30mcg

### Carne Roșie

- Fier: 2-3mg
- B12: 1-2mcg
- Zinc: 2-3mg

### Legume (Beans, Lentils)

- Fier: 2-3mg
- Folat: 100-150mcg
- Magneziu: 50-80mg

## Corelare cu Suplimente

AI-ul verifică ce suplimente ai luat astăzi și sugerează automat:

### Exemplu 1: Supliment Luat

```
"Am luat Omega-3 supliment astăzi"
→ AI corelează cu mesele tale și nu mai sugerează să iei din nou

"Am mâncat somon cu Omega-3 în plan"
→ AI: "Perfect! Ai obținut omega-3 din somon. Nu uita să iei suplimentul Omega-3 cu masa următoare."
```

### Exemplu 2: Supliment Lipsă

```
"Nu am mâncat pește astăzi și am Omega-3 în plan"
→ AI: "Nu ai mâncat pește astăzi. Asigură-te să iei suplimentul Omega-3."
```

### Exemplu 3: Deficit Detectat

```
"Nu ai supliment de Calciu în plan și nu ai consumat lactate"
→ AI: "Nu ai consumat lactate astăzi. Sugerez să adaugi un supliment de Calciu la planul tău."
```

## Structura Datelor Logate

### NutritionLog (Pentru Mese)

```json
{
  "userId": "...",
  "date": "2024-01-15T12:00:00Z",
  "mealType": "dinner",
  "items": [
    {
      "name": "salmon with quinoa and broccoli",
      "calories": 450,
      "protein": 45,
      "carbs": 35,
      "fat": 15
    }
  ],
  "total": {
    "calories": 450,
    "protein": 45,
    "carbs": 35,
    "fat": 15
  },
  "micronutrients": {
    "omega3": 750,
    "vitaminD": 7,
    "iron": 2,
    "folate": 150,
    "zinc": 2
  }
}
```

### Log (Pentru Apă, Somn, Workout)

```json
{
  "userId": "...",
  "type": "hydration",
  "value": 5,
  "unit": "glasses",
  "date": "2024-01-15T10:00:00Z"
}
```

## Confirmări în UI

Când AI loghează ceva, vei vedea:

### Toast Notification

```
✓ Logged 1 action(s) successfully!
```

### În Mesajul AI

```
Răspunsul AI...

✓ Logged meal: salmon with quinoa and broccoli 450 cal (micronutrients: omega3, iron, folate, zinc)
✓ Logged water: 5 glasses
✓ Logged sleep: 7 hours
```

## Exemple Complete de Conversații

### Exemplu 1: Zi Completă

```
Tu: "Bună dimineața! Am dormit 7 ore."
AI: "Bună dimineața! Excelent că ai dormit 7 ore. Asta te ajută să fii energic toată ziua. 😴"
     ✓ Logged sleep: 7 hours

Tu: "Am băut un pahar de apă"
AI: "Perfect! Hydration este esențială. 👍"
     ✓ Logged water: 1 glasses

Tu: "Am luat mic dejun cu ouă și avocado"
AI: "Ce alegere excelentă! Ouăle sunt o sursă completă de proteine, iar avocado-ul are grăsimi sănătoase. 🥑"
     ✓ Logged meal: eggs and avocado 350 cal (micronutrients: protein, vitaminD, folate)

Tu: "Am mâncat salată cu spanac la prânz"
AI: "Foarte bine! Spanac-ul este bogat în fier și folat. 💪"
     ✓ Logged meal: spinach salad 250 cal (micronutrients: iron, folate, calcium)

Tu: "Am făcut workout 45 de minute"
AI: "Impresionant! Keep up the great work! 💪"
     ✓ Logged workout: 45 min
```

### Exemplu 2: Micronutrienți Complete

```
Tu: "Am mâncat somon cu quinoa și broccoli la cină"
AI: "Excelentă alegere! Somon-ul este bogat în omega-3 și vitamina D, quinoa-ul în proteine și fier, iar broccoli-ul în folat și vitamina C. Această masă acoperă multe nevoi nutriționale! 🐟"
     ✓ Logged meal: salmon with quinoa and broccoli 450 cal (micronutrients: omega3, vitaminD, iron, folate, zinc)
```

## Verificare Date Logate

### În Dashboard

- Vezi progresul zilnic pentru:
  - Calorii consumate
  - Proteine, Carbs, Grăsimi
  - Micro-nutrienți (din API `/api/dashboard/data`)

### În Nutrition Page

- Toate mesele logate
- Micronutrienți consumați
- Suplimente luate

### În History

- Istoric complet pentru fiecare zi
- Scor de wellness bazat pe datele logate

## Best Practices

1. **Fi Natural**: Scrie așa cum vorbesti, AI înțelege
2. **Mentiuni Cantități**: "5 pahare", "7 ore", "45 minute" pentru mai multă precizie
3. **Descrie Mesele**: Cu cât mai multe detalii, cu atât mai precise estimările
4. **Verifică Confirmările**: Vezi ce a fost logat pentru a te asigura că e corect

## Troubleshooting

### Datele nu se loghează?

1. Verifică că ești autentificat
2. Verifică backend-ul rulează (http://localhost:4000)
3. Verifică console pentru erori

### Micronutrienții lipsesc?

- AI estimează pe baza descrierii mesei
- Cu cât descrii mai detaliat (ex: "somon copt", "salată cu spanac"), cu atât mai precise sunt estimările

### Vrei să corectezi o înregistrare?

- Poți șterge manual din Nutrition Page sau Dashboard
- Sau întreabă AI: "Am greșit, am mâncat de fapt 2 ouă"

## Concluzie

AI-ul face totul automat! Doar scrie natural în chat și toate datele sunt logate și corelate cu suplimentele tale pentru o nutriție optimă! 🎯
