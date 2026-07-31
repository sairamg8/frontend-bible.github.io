# 🔷 Structural Typing: Duck Typing, Excess Property Checks & Variance

## 1. Under-The-Hood Mechanics

TypeScript's type compatibility is **structural** ("if it has the right shape, it's compatible"), not **nominal** ("only if it's explicitly declared to be that type") — a fundamentally different model from languages like Java/C#, and the source of several behaviors that surprise engineers coming from nominally-typed backgrounds.

```typescript
interface Point { x: number; y: number; }

class Vector { x = 0; y = 0; z = 0; } // NEVER declared to implement Point — no relationship at all

function logPoint(p: Point) { console.log(p.x, p.y); }

logPoint(new Vector()); // ✅ COMPILES — Vector HAS the required shape (x, y as numbers), structurally
```
This works because TypeScript checks "does this value have at least the members `Point` requires, with compatible types" — it never checks *declared* type identity or explicit `implements` relationships for this kind of assignability.

### Excess Property Checks: Object Literals Are Checked Stricter
```typescript
function logPoint(p: Point) { /* ... */ }

const vec = new Vector();
logPoint(vec); // ✅ fine — vec is a VARIABLE, only checked for having the required shape

logPoint({ x: 1, y: 2, z: 3 }); // ❌ ERROR: object literal may only specify known properties, 'z' does not exist
```
Excess property checks exist **specifically** for object literals passed directly as an argument — a narrower, stricter check than plain structural assignability, added because a fresh object literal with an unexpected extra property is very often a typo (e.g. `{ x: 1, y: 2, zz: 3 }` meant to be `z`) that structural typing alone wouldn't catch (since having an *extra* property doesn't violate "has at least the required shape").

### Variance: Function Parameter Compatibility
TypeScript checks function type compatibility using **bivariant** parameter checking for method syntax (looser, for historical/practical reasons) but **contravariant** checking for function-type properties — meaning a function expecting a narrower parameter type can sometimes be used where a wider one is expected, and vice versa, depending on exactly how the function type was declared. This asymmetry is a genuine, sometimes-surprising TypeScript-specific quirk rather than a strict feature.

---

## 2. Real-World Engineering Scenario

**Scenario**: A Configuration Object Typo That Structural Typing Alone Wouldn't Have Caught.
A team's deployment config expects `{ region: string; replicas: number }`. An engineer passes `{ region: 'us-east-1', replicas: 3, relicas: 5 }` (a typo, `relicas` instead of a second `replicas`) directly as an object literal. Because this is a literal passed inline (not stored in a variable first), TypeScript's excess property check catches the typo at compile time — if the same object had instead been built via a variable (`const config = {...}; deploy(config)`), the typo would have silently passed as an "extra, harmless" property, structurally compatible despite being a clear mistake.

---

## 3. Production-Grade Code Example

```typescript
// Structural compatibility across genuinely unrelated types — no shared ancestry required
interface Serializable { toJSON(): string; }

class LogEntry {
  constructor(private message: string) {}
  toJSON() { return JSON.stringify({ message: this.message }); } // never declared `implements Serializable`
}

function persist(item: Serializable) { save(item.toJSON()); }
persist(new LogEntry('startup complete')); // ✅ structurally compatible — no explicit relationship needed
```

```typescript
// Excess property checks catching a real typo — but ONLY for object literals
interface DeployConfig { region: string; replicas: number; }

function deploy(config: DeployConfig) { /* ... */ }

deploy({ region: 'us-east-1', replicas: 3, relicas: 5 });
// ❌ Error: Object literal may only specify known properties, and 'relicas' does not exist in type 'DeployConfig'

const config = { region: 'us-east-1', replicas: 3, relicas: 5 };
deploy(config); // ✅ COMPILES — no excess check applies once it's a variable, typo silently ignored!
```

```typescript
// Contravariant parameter checking in practice — assigning a WIDER-parameter function where narrower was expected
type AnimalHandler = (a: { name: string }) => void;
type DogHandler = (d: { name: string; breed: string }) => void;

const handleAnimal: AnimalHandler = (a) => console.log(a.name);
const handleDog: DogHandler = handleAnimal; // ✅ allowed — handleAnimal accepts LESS specific input, safe to use as a DogHandler

// The reverse is NOT safe and IS rejected:
const handleSpecificDog: DogHandler = (d) => console.log(d.breed);
const handleAnyAnimal: AnimalHandler = handleSpecificDog; // ❌ Error — handleSpecificDog REQUIRES `breed`, which a plain Animal doesn't have
```

---

## 4. Senior Engineer Edge Cases & Pitfalls

### ⚠️ Pitfall 1: Relying on Excess Property Checks as a General-Purpose Typo Guard
```typescript
// ❌ FALSE SENSE OF SECURITY: the excess check ONLY fires for literals passed DIRECTLY —
// routing through even one intermediate variable defeats it entirely, as shown above
const config = { region: 'us-east-1', replicas: 3, relicas: 5 };
deploy(config); // typo slips through silently

// ✅ CORRECT: don't rely on this check as the primary defense against typos in config objects
// assembled dynamically — consider a runtime schema validator (zod, etc.) for genuinely
// user/config-supplied data, which checks the ACTUAL object regardless of how it was constructed
```

### ⚠️ Pitfall 2: Assuming Structural Compatibility Means Semantic Equivalence
```typescript
// ❌ DANGEROUS: these are structurally IDENTICAL (both { value: number }) but represent
// completely different domain concepts — TypeScript happily allows swapping them
type Celsius = { value: number };
type Fahrenheit = { value: number };

function heatWater(temp: Celsius) { /* assumes Celsius semantics */ }
const tempF: Fahrenheit = { value: 100 };
heatWater(tempF); // ✅ COMPILES — structurally identical, but semantically WRONG (100°F ≠ 100°C)

// ✅ CORRECT: use branded/nominal types to prevent this exact class of mistake —
// see the Advanced Patterns doc (../15-advanced-patterns/01-real-world-type-engineering.md)
```

### ⚠️ Pitfall 3: Being Surprised by Bivariant Method Parameter Checking
```typescript
// ❌ SURPRISING: method-syntax function properties use LOOSER (bivariant) checking than
// function-property syntax, meaning this UNSAFE assignment is allowed with `strictFunctionTypes`
// enabled for function-type PROPERTIES but not for METHOD syntax — a genuine TS-specific gotcha
interface Handler { handle(event: { type: string; payload: unknown }): void; } // method syntax — bivariant
class SpecificHandler implements Handler {
  handle(event: { type: 'click' }) { /* narrower than Handler's declared parameter — but ALLOWED here */ }
}

// ✅ AWARENESS: prefer function-property syntax (handle: (event: ...) => void) when strict,
// contravariant-only parameter checking is specifically desired for safety-critical callback types
```
